import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.patches import Rectangle
from scipy.sparse import linalg as ln
from scipy.sparse import csc_matrix
from pathlib import Path
import portalocker
import os
import time
import sys
current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)
from db import MongoConnector


def calculate_center_of_mass(x, psi):
    density = np.abs(psi)**2
    total_density = np.sum(density)
    x_cm = np.sum(x * density) / total_density
    return x_cm


class Wave_Packet3D:
    def __init__(self, sigma0=0.5, k0=6, x0=0.2, barrier_height=200, barrier_width=0.6, slit_space=0.8, slit_sep=1.0):
        self.L = 8
        self.t_Loc = 4.5
        self.dx = 0.1
        self.Nx = self.Ny = int(self.L / self.dx) + 1
        self.k0 = k0
        self.sigma0 = sigma0
        self.x0 = self.L * x0
        self.y0 = self.L / 2
        self.w = barrier_width
        self.s = slit_sep
        self.a = slit_space
        self.b_left = int((self.t_Loc - self.w / 2) / self.dx)
        self.b_right = int((self.t_Loc + self.w / 2) / self.dx)
        self.lower_slit_b = int(1 / (2 * self.dx) * (self.L + self.s) + self.a / self.dx)
        self.lower_slit_t = int(1 / (2 * self.dx) * (self.L + self.s))
        self.upper_slit_b = int(1 / (2 * self.dx) * (self.L - self.s))
        self.upper_slit_t = int(1 / (2 * self.dx) * (self.L - self.s) - self.a / self.dx)
        # if Path(f'cache/interference/probs_{k0}_{slit_space}_{slit_sep}.npy').exists():
        #     self.probs = np.load(f'cache/interference/probs_{k0}_{slit_space}_{slit_sep}.npy')
        #     self.Nt = self.probs.shape[0]
        # else:
        self.potential = self.potential_init(barrier_height)
        self.Ni = (self.Nx - 2) * (self.Ny - 2)

        self.evo_matrix = self.evo_matrix_cons()
        self.x = np.linspace(0, self.L, self.Ny - 2)
        self.y = np.linspace(0, self.L, self.Ny - 2)
        self.x, self.y = np.meshgrid(self.x, self.y)

        self.psi0 = self.psi0_init(self.sigma0, self.k0)
        self.probs = []
        self.probs.append(np.sqrt(np.real(self.psi0) ** 2 + np.imag(self.psi0) ** 2))

        for i in range(1, self.Nt):
            psi_vect = self.psi0.reshape((self.Ni))
            psi_vect = self.evo_matrix.dot(psi_vect)
            self.psi0 = psi_vect.reshape((self.Nx - 2, self.Ny - 2))
            self.probs.append(np.sqrt(np.real(self.psi0) ** 2 + np.imag(self.psi0) ** 2))
        self.probs = np.array(self.probs)

        # try:
        #     np.save(f'cache/interference/probs_{k0}_{slit_space}_{slit_sep}.npy', self.probs)
        # except:
        #     Path('cache/interference/').mkdir(parents=True, exist_ok=True)
        #     np.save(f'cache/interference/probs_{k0}_{slit_space}_{slit_sep}.npy', self.probs)


    def potential_init(self, v0):
        v = np.zeros((self.Ny, self.Ny), complex)
        v[0:self.upper_slit_t, self.b_left:self.b_right] = v0
        v[self.upper_slit_b:self.lower_slit_t, self.b_left:self.b_right] = v0
        v[self.lower_slit_b:, self.b_left:self.b_right] = v0
        return v

    def psi0_init(self, sigma=0.5, k=1):
        psi0 = np.exp(-1 / 2 * ((self.x - self.x0) ** 2 + (self.y - self.y0) ** 2) / sigma ** 2) * np.exp(1j * k * (self.x - self.x0))

        x_cm_initial = calculate_center_of_mass(self.x, psi0)
        psi_test = (self.evo_matrix.dot(np.copy(psi0).reshape((self.Ni)))).reshape((self.Nx - 2, self.Ny - 2))
        x_cm_later = calculate_center_of_mass(self.x, psi_test)
        dx_per_step = x_cm_later - x_cm_initial
        self.Nt = min(800, int(1.5 * self.L / abs(dx_per_step)))
        if dx_per_step < 0:  # Assuming "forward" is in the positive x direction
            psi0 = np.exp(-1 / 2 * ((self.x - self.x0) ** 2 + (self.y - self.y0) ** 2) / sigma ** 2) * np.exp(1j * (-k) * (self.x - self.x0))
        psi0[0, :] = psi0[-1, :] = psi0[:, 0] = psi0[:, -1] = 0

        return psi0

    def evo_matrix_cons(self):
        Dt = self.dx ** 2 / 4
        rx, ry = -Dt / (2j * self.dx ** 2), -Dt / (2j * self.dx ** 2)
        A = np.zeros((self.Ni, self.Ni), complex)
        M = np.zeros((self.Ni, self.Ni), complex)
        for k in range(self.Ni):
            # k = (i-1)*(Ny-2) + (j-1)
            i = 1 + k // (self.Ny - 2)
            j = 1 + k % (self.Ny - 2)

            # Main central diagonal.
            A[k, k] = 1 + 2 * rx + 2 * ry + 1j * Dt / 2 * self.potential[i, j]
            M[k, k] = 1 - 2 * rx - 2 * ry - 1j * Dt / 2 * self.potential[i, j]

            if i != 1:  # Lower lone diagonal.
                A[k, (i - 2) * (self.Ny - 2) + j - 1] = -ry
                M[k, (i - 2) * (self.Ny - 2) + j - 1] = ry

            if i != self.Nx - 2:  # Upper lone diagonal.
                A[k, i * (self.Ny - 2) + j - 1] = -ry
                M[k, i * (self.Ny - 2) + j - 1] = ry

            if j != 1:  # Lower main diagonal.
                A[k, k - 1] = -rx
                M[k, k - 1] = rx

            if j != self.Ny - 2:  # Upper main diagonal.
                A[k, k + 1] = -rx
                M[k, k + 1] = rx
        Asp = csc_matrix(A)
        Msp = csc_matrix(M)
        evolution_matrix = ln.inv(Asp).dot(Msp).tocsr()
        return evolution_matrix


class Animator3D:
    def __init__(self, wave_packet):
        self.wave_packet = wave_packet
        self.fig = plt.figure(figsize=(9, 4))
        self.ax = self.fig.add_subplot(111, xlim=(0, self.wave_packet.L), ylim=(0, self.wave_packet.L))

        self.img = self.ax.imshow(self.wave_packet.probs[0], extent=[0, self.wave_packet.L, 0, self.wave_packet.L],
                             cmap=plt.get_cmap("hot"), vmin=0, vmax=np.max(self.wave_packet.probs), zorder=1)
        self.colorbar = self.fig.colorbar(self.img, ax=self.ax, orientation='vertical', fraction=.1, pad=0.05)
        self.ax.set_xlabel('X Position (nm)')
        self.ax.set_ylabel('Y Position (nm)')
        self.ax.text(0.5, 1.05, 'Probability Density', transform=self.ax.transAxes, ha='center')
        slitcolor = "w"
        slitalpha = 0.8  # Transparency of the rectangles.
        wall_bottom = Rectangle((self.wave_packet.b_left * self.wave_packet.dx, 0),
                                self.wave_packet.w, self.wave_packet.upper_slit_t * self.wave_packet.dx,
                                color=slitcolor, zorder=50, alpha=slitalpha)
        wall_middle = Rectangle((self.wave_packet.b_left * self.wave_packet.dx, self.wave_packet.upper_slit_b * self.wave_packet.dx),
                                self.wave_packet.w, (self.wave_packet.lower_slit_t - self.wave_packet.upper_slit_b) * self.wave_packet.dx,
                                color=slitcolor, zorder=50, alpha=slitalpha)
        wall_top = Rectangle((self.wave_packet.b_left * self.wave_packet.dx, self.wave_packet.lower_slit_b * self.wave_packet.dx),
                             self.wave_packet.w, self.wave_packet.upper_slit_t * self.wave_packet.dx,
                             color=slitcolor, zorder=50, alpha=slitalpha)

        self.ax.add_patch(wall_bottom)
        self.ax.add_patch(wall_middle)
        self.ax.add_patch(wall_top)

    def update(self, i):
        self.img.set_data(self.wave_packet.probs[i])
        self.img.set_zorder(1)

        return self.img,

    def animate3D(self):
        anim = FuncAnimation(self.fig, self.update, interval=1, frames=np.arange(0, self.wave_packet.Nt - 100, 10), repeat=False,
                             blit=0)
        anim_js = anim.to_jshtml(fps=30)

        ## No longer need to save the file locally
        path = os.path.abspath(os.path.join(f"quantum_app_backend/cache/interference/probs_{self.wave_packet.k0}_{self.wave_packet.a}_{self.wave_packet.s}_3D.html"))
        if not Path(path).exists():
            with open(path, "w", encoding="utf-8") as f:
                portalocker.lock(f, portalocker.LOCK_EX)
                f.write(anim_js)

        return anim_js

# Driver to upload interference models to MongoDB
if __name__ == "__main__":
    mongo = MongoConnector()
    wave_packet = Wave_Packet3D(slit_space=2, slit_sep=2, k0=2)
    animator = Animator3D(wave_packet)

    parameters = {'momentum': wave_packet.k0, 'spacing': wave_packet.a, 'slit_separation': wave_packet.s}
    mongo.set_collection('interference')
    
    start_time = time.time()

    anim_js = animator.animate3D()
    mongo.upload_model(parameters, anim_js)

    end_time = time.time()
    
    print('Interference model inserted successfully')
    print(f"Time taken: {end_time - start_time}")
    
    mongo.close()