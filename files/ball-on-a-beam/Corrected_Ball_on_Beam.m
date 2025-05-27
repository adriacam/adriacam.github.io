
%% Mathematical Modelling and State Equations of "Ball-on-Beam" System
% This document derives the mathematical model of the "ball-on-beam" system
% and expresses it in the form of nonlinear state equations using Lagrange's approach.

%% Definitions and Variable Declarations
clc;
clearvars;

% Define symbolic variables
syms x_ball(t) beta_beam(t) M(t) F(t) r_ball J_ball m_ball g J_beam
syms q1(t) q2(t) x1(t) x2(t) x3(t) x4(t) u(t) z(t)
syms x1dot x2dot x3dot x4dot

%% Generalized Coordinates
% Generalized coordinates for the system:
x_ball = q1; % Ball position
beta_beam = q2; % Beam angle

%% Total Kinetic Energy
xref_ball(t) = q1 * cos(q2); % x-coordinate of ball's center
yref_ball(t) = q1 * sin(q2); % y-coordinate of ball's center

% Translational velocity of ball
vref_ball(t) = simplify(sqrt(diff(xref_ball, t)^2 + diff(yref_ball, t)^2));

% Angular velocity of ball
omegabeam_ball(t) = -diff(q1, t) / r_ball; % Rolling condition
omegaref_ball(t) = omegabeam_ball + diff(q2, t);

% Kinetic energy of ball
T_ball = 0.5 * J_ball * omegaref_ball(t)^2 + 0.5 * m_ball * vref_ball(t)^2;

% Kinetic energy of beam
T_beam = 0.5 * J_beam * diff(q2, t)^2;

% Total kinetic energy
T = T_ball + T_beam;

%% Total Potential Energy
V = g * m_ball * yref_ball;

%% Lagrangian
L = simplify(T - V);

%% Non-conservative Forces
% Force and torque vectors
Fref_vec = F * [cos(beta_beam); sin(beta_beam); 0];
Mref_vec = M * [0; 0; 1];

% Contact point velocity
xref_C = cos(q2) * (q1 - r_ball);
yref_C = sin(q2) * (q1 - r_ball);
vref_C = simplify(sqrt(diff(xref_C, t)^2 + diff(yref_C, t)^2));

% Non-conservative forces
Q1_nc = simplify(transpose(Fref_vec) * diff(vref_C, diff(q1, t)));
Q2_nc = simplify(transpose(Mref_vec) * diff(diff(q2, t), diff(q2, t)));

%% Equations of Motion
deq1 = simplify(diff(diff(L, diff(q1, t)), t) - diff(L, q1)) == Q1_nc;
deq2 = simplify(diff(diff(L, diff(q2, t)), t) - diff(L, q2)) == Q2_nc;

%% State Space Representation
% State definitions
x1_def = q1 == x1;
x2_def = diff(q1, t) == x2;
x3_def = q2 == x3;
x4_def = diff(q2, t) == x4;

x1dot_def = x2 == x1dot;
x2dot_def = diff(q1, t, 2) == x2dot;
x3dot_def = x4 == x3dot;
x4dot_def = diff(q2, t, 2) == x4dot;

% Substitute state variables into equations of motion
deq1_in_xuz = subs(deq1, [diff(q1, t, 2), diff(q1, t), q1, diff(q2, t, 2), diff(q2, t), q2], ...
                         [x2dot, x2, x1, x4dot, x4, x3]);
deq2_in_xuz = subs(deq2, [diff(q1, t, 2), diff(q1, t), q1, diff(q2, t, 2), diff(q2, t), q2], ...
                         [x2dot, x2, x1, x4dot, x4, x3]);

% Substitute inputs
deq1_in_xuz = subs(deq1_in_xuz, [M, F], [u, z]);
deq2_in_xuz = subs(deq2_in_xuz, [M, F], [u, z]);

% Solve for time derivatives of states
aux = solve([x1dot_def, deq1_in_xuz, x3dot_def, deq2_in_xuz], [x1dot, x2dot, x3dot, x4dot]);

% Vector function f(x,u,z)
f = simplify([aux.x1dot; aux.x2dot; aux.x3dot; aux.x4dot]);

%% Output Equations
h = [x1; x3]; % Ball position and beam angle

%% Display Final Equations
disp('State Space Equations:');
disp('dx/dt = f(x, u, z)');
disp(f);
disp('Output y = h(x)');
disp(h);
