import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.patches import Rectangle
from mpl_toolkits.axes_grid1.inset_locator import inset_axes
from scipy.sparse import linalg as ln
from scipy.sparse import csc_matrix
from pathlib import Path
import portalocker
import os

def calculate_center_of_mass(x, psi):
    density = np.abs(psi)**2
    total_density = np.sum(density)
    x_cm = np.sum(x * density) / total_density
    return x_cm


class Wave_Packet3D:
    def __init__(self, sigma0=0.5, k0=1, x0=0.2, barrier_height=15, barrier_width=1.0):
        self.L = 8
        self.t_Loc = 4.5
        self.dx = 0.1
        self.Nx = self.Ny = int(self.L / self.dx) + 1
        self.k0 = k0
        self.sigma0 = sigma0
        self.x0 = self.L * x0
        self.y0 = self.L / 2
        self.w = barrier_width
        self.v_max = barrier_height
        self.b_left = int((self.t_Loc - self.w / 2) / self.dx)
        self.b_right = int((self.t_Loc + self.w / 2) / self.dx)
        self.Ni = (self.Nx - 2) * (self.Ny - 2)
        self.potential = self.potential_init(barrier_height)

        # if Path(f'cache/tunneling/probs_{k0}_{barrier_height}_{barrier_width}_3D.npy').exists():
        #     self.probs = np.load(f'cache/tunneling/probs_{k0}_{barrier_height}_{barrier_width}_3D.npy')
        #     self.Nt = self.probs.shape[0]
        # else:
        self.evo_matrix = self.evo_matrix_cons()
        self.x = np.linspace(0, self.L, self.Ny - 2)  # Array of spatial points.
        self.y = np.linspace(0, self.L, self.Ny - 2)  # Array of spatial points.
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
        #     np.save(f'cache/tunneling/probs_{k0}_{barrier_height}_{barrier_width}_3D.npy', self.probs)
        # except:
        #     Path('cache/tunneling/').mkdir(parents=True, exist_ok=True)
        #     np.save(f'cache/tunneling/probs_{k0}_{barrier_height}_{barrier_width}_3D.npy', self.probs)


    def potential_init(self, v0):
        v = np.zeros((self.Ny, self.Ny), complex)
        v[:, self.b_left:self.b_right] = v0
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
        self.x_ticks = np.linspace(0, self.wave_packet.L, self.wave_packet.Nx - 2)
        self.fig = plt.figure(figsize=(12, 6))
        self.ax_top = self.fig.add_subplot(121, xlim=(0, self.wave_packet.L), ylim=(0, self.wave_packet.L))

        self.img_top = self.ax_top.imshow(self.wave_packet.probs[0], extent=[0, self.wave_packet.L, 0, self.wave_packet.L],
                                          cmap=plt.get_cmap("hot"), vmin=0, vmax=np.max(self.wave_packet.probs), zorder=1)
        self.colorbar = self.fig.colorbar(self.img_top, ax=self.ax_top, orientation='vertical', fraction=.1, pad=0.05)
        self.ax_top.set_xlabel('X Position (nm)')
        self.ax_top.set_ylabel('Y Position (nm)')
        self.ax_top.text(0.5, 1.05, 'Probability Density', transform=self.ax_top.transAxes, ha='center')
        slitcolor = "w"
        slitalpha = 0.8  # Transparency of the rectangles.
        wall = Rectangle((self.wave_packet.b_left * self.wave_packet.dx, 0),
                                self.wave_packet.w, self.wave_packet.L,
                                color=slitcolor, zorder=50, alpha=slitalpha)

        self.ax_top.add_patch(wall)

        self.ax_2ndC = self.fig.add_subplot(122)
        self.ax_2ndC.axis('off')
        self.ax_front = inset_axes(self.ax_2ndC, width="90%", height="78%", loc='center right',
                                   bbox_to_anchor=(0, 0., 1, 1), bbox_transform=self.ax_2ndC.transAxes)
        self.ax_front.plot(self.x_ticks, np.real(self.wave_packet.potential)[self.wave_packet.Ny // 2, 1:-1], color='r',
                           label='Potential')
        self.line, = self.ax_front.plot(self.x_ticks, self.wave_packet.probs[0, self.wave_packet.Ny // 2, :],
                                        color='blue')
        self.ax_front.set_ylim(0, 1.5)
        self.ax_front.set_xlim(0, self.wave_packet.L)
        self.ax_front.set_xlabel('X Position (nm)')
        self.ax_front.set_ylabel('Probability Density')
        self.ax_front.text(0.5, 1.05, 'Front View', transform=self.ax_front.transAxes, ha='center')

    def update(self, i):
        self.img_top.set_data(self.wave_packet.probs[i])  # Fill img_top with the modulus data of the wave function.
        self.img_top.set_zorder(1)

        self.line.set_ydata(self.wave_packet.probs[i, self.wave_packet.Ny // 2, :])

        return self.img_top, self.line,

    def animate3D(self):
        anim = FuncAnimation(self.fig, self.update, interval=1, frames=np.arange(0, self.wave_packet.Nt, 2), repeat=False,
                             blit=0)
        anim_js = anim.to_jshtml(fps=60)
        path = os.path.abspath(os.path.join(f"quantum_app_backend/cache/tunneling/probs_{self.wave_packet.k0}_{self.wave_packet.v_max}_{self.wave_packet.w}_3D.html"))
        if not Path(path).exists():
            with open(path, "w", encoding="utf-8") as f:
                portalocker.lock(f, portalocker.LOCK_EX)
                f.write(anim_js)
        return anim_js


if __name__ == "__main__":
    wave_packet = Wave_Packet3D(barrier_width=1, barrier_height=10, k0=2)

    animator = Animator3D(wave_packet)
    test = animator.animate3D()
