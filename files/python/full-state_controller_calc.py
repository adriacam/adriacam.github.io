import numpy as np

# System matrices (continuous‐time)
L = 0.5
Jb = 0.02
A = np.array([
    [0,   1,     0, 0],
    [0,   0, 9.81/L, 0],
    [0,   0,     0, 1],
    [0,   0,     0, 0]
])
B = np.array([[0],[0],[0],[1/Jb]])

# Desired poles (all at -3)
p = [-3, -3, -3, -3]
# Characteristic polynomial: (s+3)^4 = s^4 +12s^3 +54s^2 +108s +81
a = [1, 12, 54, 108, 81]

# Build controllability matrix
C = np.hstack([B, A.dot(B), A.dot(A).dot(B), A.dot(A).dot(A).dot(B)])
assert np.linalg.matrix_rank(C) == 4, "System must be controllable"

# Ackermann's formula: K = [0 0 0 1] · C⁻¹ · (A⁴ +12A³ +54A² +108A +81I)
phiA = (np.linalg.matrix_power(A,4)
        + 12*np.linalg.matrix_power(A,3)
        + 54*np.linalg.matrix_power(A,2)
        + 108*A
        + 81*np.eye(4))
e4 = np.array([[0,0,0,1]])
K = e4.dot(np.linalg.inv(C)).dot(phiA)

print("K =", np.round(K.flatten(), 4))
