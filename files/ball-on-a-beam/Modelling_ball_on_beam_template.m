%% 
% 
%% *Mathematical Modelling and State Equations of "Ball-on-Beam" System*
% In this document a mathematical model of the "ball-on-beam" system illustrated 
% below is derived and expressed in form of nonlinear state equations. To this 
% end, Lagrange's approach for modelling mechanical systems is applied.
% 
% 
%% Definitions and Variable Declarations

clc;                                    % clear display
clearvars;                              % reset variables
% System description and definition of important quantities
% The following schematic diagram defines coordinate systems and counting directions 
% of important quantities. 
% 
% 
% 
% In particular, the figure introduces the fixed Cartesian reference frame $\left(x^{\textrm{ref}} 
% ,y^{\textrm{ref}} \right)$ and the beam-fixed coordinate system $\left(x^{\textrm{beam}} 
% ,y^{\textrm{beam}} \right)$ which is rotated by the beam angle $\beta_{\textrm{beam}} 
% \left(t\right)$ with respect to the reference frame. The beam is pivot-mounted 
% at the common origin of these coordinate systems such that it can freely rotate 
% around the $z$-axis. By means of an electric motor, which is of no further interest, 
% the torque $M\left(t\right)$ can be applied to the beam, i.e. $M\left(t\right)$ 
% represents the control input $u\left(t\right)$. A force $F\left(t\right)$ acting 
% on the ball must be taken into account as disturbance input $z\left(t\right)$. 
% It is assumed that the ball rolls on the beam without slipping at all times. 
% All other friction forces and/or torques are neglected. The measured variables 
% are the beam angle $\beta_{\textrm{beam}} \left(t\right)$ and the ball position 
% on the beam $x_{\textrm{ball}} \left(t\right)$, which corresponds to the $x$-value 
% of the ball's center of mass in beam-coordinates. The meaning of some other 
% parameters and quantities of interest is described by the comments in the following 
% variable declaration.
% *Declare symbolic variables*

syms x_ball(t)                          % ball position on beam (in beam coordinate system)
syms beta_beam(t)                       % beam angle
syms M(t)                               % motor torque acting on beam
syms F(t)                               % disturbance force acting on ball
syms r_ball                             % radius of ball
syms J_ball                             % moment of inertia of ball with respect to its symmetry axis
syms m_ball                             % mass of ball
syms g                                  % gravity of earth
syms J_beam                             % moment of inertia of beam with respect to its fixed axis of rotation arount pivot point
syms q1(t) q2(t)                        % generalized coordinates
syms x1(t) x2(t) x3(t) x4(t) u(t) z(t)  % state variables x, control input u, disturbance input z
syms x1dot x2dot x3dot x4dot            % auxiliary variables needed to express the state differential equations
%% *Specify Generalized Coordinates*
% It is obvious that the position and orientation of the ball and the beam are 
% completely defined if both $x_{\textrm{ball}}$ and $\beta {\;}_{\textrm{beam}}$ 
% are known. Thus, the system has two degrees of freedom and the two measured 
% variables can be defined as generalized coordinates:

x_ball = q1
beta_beam = q2
%% *Determine Total Kinetic Energy of the System*
% The "ball-on-beam" system consists of two rigid bodies: the ball and the beam. 
% Consequently, the total kinetic energy can be expressed as the sum of the kinetic 
% energy of the ball and the kinetic energy of the beam.
% *Kinetic energy of the ball*
% The overall motion of the ball is rather complex, since it simultaneously 
% performs a rotational and a translational movement. With respect to its center 
% of mass, however, the kinetic energy of any rigid body can still be stated as 
% a simple sum of a purely translational and a purely rotational movement in relation 
% to a fixed and non-moving reference coordinate system. Thus, the total kinetic 
% energy of the ball $T_{\textrm{ball}}$ can be calculated as
% 
% $$T_{\textrm{ball}} =\frac{1}{2}J_{\textrm{ball}} {\left|\omega {\;}_{\textrm{ball}\;}^{\textrm{ref}} 
% \right|}^2 +\frac{1}{2}m_{\textrm{ball}} {\left|v_{\textrm{ball}}^{\textrm{ref}} 
% \right|}^2$$
% 
% with
% 
% $\left|\omega {\;}_{\textrm{ball}\;}^{\textrm{ref}} \right|$: absolute value 
% of angular ball speed around its center of mass with respect to fixed reference 
% coordinate system
% 
% $\left|v_{\textrm{ball}}^{\textrm{ref}} \right|$: absolute value of translational 
% speed at center of mass with respect to fixed reference coordinate system
% Calculation of the translational speed at the center of mass $\left|v_{\textrm{ball}}^{\textrm{ref}} \right|$
% Position of the ball's center of mass in the fixed Cartesian reference frame 
% as a function of the generalized coordinates:

xref_ball(t) = q1 * cos(q2)
yref_ball(t) = q1 * sin(q2)
%% 
% Absolute value of translational ball speed as a function of $q_{1/2}$ and 
% ${\dot{q} }_{1/2}$ with respect to the fixed reference coordinate system:

vref_ball(t) = simplify(sqrt(diff(xref_ball(t),t)^2+diff(yref_ball(t),t)^2))
% Calculation of the angular speed around the center of mass $\omega {\;}_{\textrm{ball}\;}^{\textrm{ref}}$
% Applying the summation rule for angular velocities (see e.g. [1]), the total 
% angular speed of the ball $\underline{\omega} {\;}_{\textrm{ball}\;}^{\textrm{ref}}$ 
% can be stated as the sum of the angular speed of the ball with respect to the 
% beam $\underline{\omega} {\;}_{\textrm{ball}\;}^{\textrm{beam}}$ and the angular 
% speed of the beam with respect to the fixed reference coordinate sytem $\underline{\omega} 
% {\;}_{\textrm{beam}\;}^{\textrm{ref}}$, i.e. $\underline{\omega} {\;}_{\textrm{ball}\;}^{\textrm{ref}} 
% =\underline{\omega} {\;}_{\textrm{ball}\;}^{\textrm{beam}} +\underline{\omega} 
% {\;}_{\textrm{beam}\;}^{\textrm{ref}}$. Since in case of the "ball-on-beam" 
% system all angular speed vectors are parallel to the $z$-axis, this vector equation 
% can be simplified to the scalar relationship $\omega {\;}_{\textrm{ball}\;}^{\textrm{ref}} 
% =\omega {\;}_{\textrm{ball}\;}^{\textrm{beam}} +\omega {\;}_{\textrm{beam}\;}^{\textrm{ref}}$ 
% where

omegaref_beam(t) = diff(q1(t),t)
%% 
% and $\underline{\omega} {\;}_{\textrm{ball}\;}^{\textrm{beam}}$ follows from 
% the ideal rolling conditions as

omegabeam_ball(t) = diff(q2(t),t)
%% 
% Note that there is a negative sign in the later equation. It is caused by 
% the fact that a negative rotation of the ball against the "right-hand-rule" 
% is needed to move the system into positive $x^{\textrm{beam}}$ direction (see 
% definition of coordinate systems and counting direction in the figure above).
% 
% Summing both terms up yields

omegaref_ball(t) = omegabeam_ball(t) + omegaref_beam(t)
% Calculation of the kinetic energy of the ball $T_{\textrm{ball}}$
% Using the above formula for the kinetic energy expressed with respect to the 
% mass center point finally yields

T_ball(t) = 0.5 * J_ball * omegaref_ball(t)^2 + 0.5* m_ball * vref_ball(t)^2
% Kinetic energy of the beam
% The beam performs a purely rotational movement around the fixed axis of rotation 
% at the center of the coordinate system (see figure above). Thus, using $J_{\textrm{beam}}$ 
% as the moment of inertia of the beam with respect to that axis, the total kinetic 
% energy of the beam is

T_beam(t) = 0.5 * J_beam * omegaref_beam(t)^2
% *Total kinetic energy of the system*
% The total kinetic energy of the system results from the sum of the kinetic 
% energy of the ball and of the beam as

T(t) =T_ball(t) + T_beam(t)
%% *Determine Total Potential Energy of the System*
% The impact of gravity can be expressed using a potential energy term. As the 
% beam's center of mass does not move, however, the total potential energy of 
% the system is solely determined by the ball, i.e. $V=V_{\textrm{ball}}$. Moreover, 
% the ball's potential energy $V_{\textrm{ball}}$only depends on its $y$-coordinate 
% in the fixed Cartesian reference coordinate system. Assuming without loss of 
% generality that ${V=V}_{\textrm{ball}} =0$ would hold if the ball's center of 
% mass was at the origin of the coordinate system, $V$ can be expressed as

V(t) = g*m_ball*yref_ball
%% Lagrangian 
% The Lagrangian 
% 
% $$L=T-V$$
% 
% can now easily be stated as a function of $q_{1/2}$ and ${\dot{q} }_{1/2}$:

L(t) = simplify(T(t) - V(t))
%% *Non-conservative Generalized Forces*
% In general, the non-conservative generalized forces $Q_{i,\textrm{nc}}$ of 
% a system with $N$ degrees of freedom are given as [1]
% 
% $Q_{i,\textrm{nc}} =\left(\sum_{k=1}^K {\underline{F} }_{k,\textrm{nc}}^T 
% \frac{\partial {\underline{v} }_{k\;} }{\partial {\dot{q} }_i }\right)+\left(\sum_{l=1}^L 
% {\underline{M} }_{l,\textrm{nc}}^T \frac{\partial {\underline{\omega} }_{l\;} 
% }{\partial {\dot{q} }_i }\right)$, $i=1,2,\ldotp \ldotp \ldotp ,N$
% 
% where ${\underline{F} }_{k,\textrm{nc}}$, $k=1,2,\ldotp \ldotp \ldotp ,K$, 
% and ${\underline{M} }_{l,\textrm{nc}}$, $l=1,2,\ldotp \ldotp \ldotp ,L$, represent 
% all non-constraint and non-conservative force and torque vectors acting on the 
% system and ${\underline{v} }_{k\;}$, $k=1,2,\ldotp \ldotp \ldotp ,K$, as well 
% as ${\underline{\omega} }_{l\;}$, $l=1,2,\ldotp \ldotp \ldotp ,L$, are the speed 
% and angular speed vectors of the corresponding contact points. 
% 
% Applied to the "ball-and-beam" system, the number of degrees of freedom is 
% $N=2$ and the external force $F\left(t\right)$ as well as the motor torque $M\left(t\right)$ 
% (see figure above) represent the only non-conservative quantities acting on 
% the mechanics. Thus, expressed in reference coordinates the formula above simplifies 
% to the two non-conservative generalized force terms
% 
% $$\begin{array}{l}Q_{1,\textrm{nc}} ={\left({\underline{F} }^{\textrm{ref}} 
% \right)}^T \frac{\;\partial {\underline{v} }_C^{\textrm{ref}} }{\partial \dot{q_1 
% } \;\;}+{\left({\underline{M} }^{\textrm{ref}} \right)}^T \frac{\;\partial {\underline{\omega} 
% }_{\textrm{beam}}^{\textrm{ref}} \;}{\partial \dot{q_1 } }\\Q_{2,\textrm{nc}} 
% ={\left({\underline{F} }^{\textrm{ref}} \right)}^T \frac{\;\partial {\underline{v} 
% }_C^{\textrm{ref}} }{\partial \dot{q_2 } \;\;}+{\left({\underline{M} }^{\textrm{ref}} 
% \right)}^T \frac{\;\partial {\underline{\omega} }_{\textrm{beam}}^{\textrm{ref}} 
% \;}{\partial \dot{q_2 } }\end{array}$$
% Force vector ${\underline{F} }^{\textrm{ref}\;}$ and corresponding speed vector of the contact point ${\underline{v} }_C^{\textrm{ref}}$ in reference coordinates
% In beam coordinates the force $F\left(t\right)$ acts in positive $x$-direction. 
% Consequently, with respect to the fixed reference coordinate system, the force 
% vector can be expressed as

Fref_vec(t) = F(t) *[cos(beta_beam);sin(beta_beam);0] 
%% 
% The position of the corresponding contact point $C$ (see figure) of the force 
% $F\left(t\right)$ in beam coordinates is  

xbeam_C(t) = x_ball(t) - r_ball
ybeam_C = r_ball 
%% 
% Transformed into the fixed Cartesian reference frame, the contact point $C$ 
% is described by

xref_C(t) =cos(q2) * xbeam_C(t)
yref_C(t) = sin(beta_beam(t))*xbeam_C(t) + r_ball / cos(beta_beam(t))
%% 
% Calculating the time derivative yields the speed vector ${\underline{v} }_C$ 
% of the contact point $C$ in reference coordinates:

vref_Cvec(t)=simplify(sqrt(diff(xref_C(t),t)^2+diff(yref_C(t),t)^2))
% Torque vector ${\underline{M} }^{\textrm{ref}\;}$ and corresponding angular speed vector ${\underline{\omega} }_{\textrm{beam}}^{\textrm{ref}} \;$ in reference coordinates
% The motor torque $M\left(t\right)$acts around the $z$-axis which represents 
% the fixed axis of rotation for the beam. Thus, we can state the associated torque 
% vector according to

Mref_vec(t) = M(t)*[0;0;1]
%% 
% and the corresponding angular speed vector as

omegaref_beamvec(t) = omegaref_beam(t)*[0;0;1]
%% 
% with respect to the Cartesian reference frame and considering the counting 
% directions specified in the figure above.
% Non-conservative generalized force $Q_{1,\textrm{nc}}$ associated to $q_1$
% Evaluating
% 
% $$Q_{1,\textrm{nc}} ={\left({\underline{F} }^{\textrm{ref}} \right)}^T \frac{\;\partial 
% {\underline{v} }_C^{\textrm{ref}} }{\partial \dot{q_1 } \;\;}+{\left({\underline{M} 
% }^{\textrm{ref}} \right)}^T \frac{\;\partial {\underline{\omega} }_{\textrm{beam}}^{\textrm{ref}} 
% \;}{\partial \dot{q_1 } }$$
% 
% results in

Q1_nc(t)=simplify(transpose(Fref_vec(t))*(diff(vref_Cvec(t),diff(q1(t),t))) ...
                    + transpose(Mref_vec(t))*(diff(omegaref_beamvec(t),diff(q1(t),t))))
%  Non-conservative generalized force $Q_{2,\textrm{nc}}$ associated to $q_2$
% Evaluating
% 
% $$Q_{2,\textrm{nc}} ={\left({\underline{F} }^{\textrm{ref}} \right)}^T \frac{\;\partial 
% {\underline{v} }_C^{\textrm{ref}} }{\partial \dot{q_2 } \;\;}+{\left({\underline{M} 
% }^{\textrm{ref}} \right)}^T \frac{\;\partial {\underline{\omega} }_{\textrm{beam}}^{\textrm{ref}} 
% \;}{\partial \dot{q_2 } }$$
% 
% results in

Q2_nc(t) = simplify(transpose(Fref_vec(t))*(diff(vref_Cvec(t),diff(q2(t),t))) ...
                    + transpose(Mref_vec(t))*(diff(omegaref_beamvec(t),diff(q2(t),t))))
%% Equations of Motion in Generalized Coordinates
% In general, using the Lagrangian $L$ and the non-conservative generalized 
% forces $Q_{i,\textrm{nc}}$, the equations of motion in the generalized coordinates 
% are obtained from the $N$ Lagrange's equations (of 2nd kind)
% 
% $\frac{d\;}{\textrm{dt}}\left(\frac{\partial L\;}{\partial {\dot{q} }_i }\right)-\frac{\;\partial 
% L}{\partial q_{i\;} }=Q_{i,\textrm{nc}}$ ,  $i=1,2,\ldotp \ldotp \ldotp ,N$
% 
% Applied to the "ball-on-beam" system with two degrees of freedom ($N=2$), 
% the evaluation of
% 
% $$\begin{array}{l}\frac{d\;}{\textrm{dt}}\left(\frac{\partial L\;}{\partial 
% {\dot{q} }_1 }\right)-\frac{\;\partial L}{\partial q_{1\;} }=Q_{1,\textrm{nc}} 
% \\\frac{d\;}{\textrm{dt}}\left(\frac{\partial L\;}{\partial {\dot{q} }_2 }\right)-\frac{\;\partial 
% L}{\partial q_{2\;} }=Q_{2,\textrm{nc}} \end{array}$$
% 
% results in the following two differential equations in the generalized coordinates:

deq1 = simplify( diff( diff(L(t),diff(q1(t),t)),t ) - diff(L(t),q1(t)) ) == Q1_nc(t)
deq2 = simplify( diff( diff(L(t),diff(q2(t),t)),t ) - diff(L(t),q2(t)) ) == Q2_nc(t) 
%% Derive (Nonlinear) State Equations
% Define state variables
% In order to obtain a state space description of the "ball-on-beam" system 
% from the equations of motion, the generalized coordinates and their first-order 
% time derivatives are introduced as state variables:

x1_def = q1(t) == x1(t)                 % x1 --> ball position on beam
x2_def = diff(q1(t),t) == x2(t)      % x2 --> translational ball speed relative to beam
x3_def = q2(t) == x3(t)             % x3 --> beam angle
x4_def = diff(q2(t),t) == x4(t)      % x4 --> angular speed of beam
% Define first-order time derivatives of the states
% In order to solve automatically for the first time derivatives of the states, 
% the later must also formally be introduced as variables:

x1dot_def =  x2 == x1dot                    % x1_dot --> x2
x2dot_def =  diff(q1(t),t,2) == x2dot       % x2_dot --> 2nd time derivative of q_1
x3dot_def =  x4 == x3dot                    % x3_dot --> x4
x4dot_def =  diff(q2(t),t,2) == x4dot       % x4_dot --> 2nd time derivative of q_2
% Define control input and disturbance input
% The motor torque $M\left(t\right)$ is defined as control input $u\left(t\right)$:

udef = M(t) == u(t)
%% 
% The force $F\left(t\right)$ is interpreted as disturbance input $z\left(t\right)$:

zdef = F(t) == z(t)
% Substitute states, control input and disturbance input in equations of motion
% Note that the substitutions of the states must be applied in the correct order:
%% 
% # Substitute the acceleration variables ${\ddot{q} }_1$ and ${\ddot{q} }_2$ 
% first.
% # Substitute the speed variables ${\dot{q} }_1$ and ${\dot{q} }_2$ second.
% # Substitute the position variables $q_1$ and $q_2$ last.

% Substitute state variables in equations of motion
deq1_in_xuz = deq1;
deq2_in_xuz = deq2;
% substitute q1_2dot --> x2dot
deq1_in_xuz = subs(deq1_in_xuz,lhs(x2dot_def),rhs(x2dot_def));   
deq2_in_xuz = subs(deq2_in_xuz,lhs(x2dot_def),rhs(x2dot_def));   
% substitute q1_dot --> x2
deq1_in_xuz = subs(deq1_in_xuz,lhs(x2_def),rhs(x2_def));         
deq2_in_xuz = subs(deq2_in_xuz,lhs(x2_def),rhs(x2_def));         
% substitute q1 --> x1
deq1_in_xuz = subs(deq1_in_xuz,lhs(x1_def),rhs(x1_def));      
deq2_in_xuz = subs(deq2_in_xuz,lhs(x1_def),rhs(x1_def));          
% substitute q2_2dot --> x4dot
deq1_in_xuz = subs(deq1_in_xuz,lhs(x4dot_def),rhs(x4dot_def));   
deq2_in_xuz = subs(deq2_in_xuz,lhs(x4dot_def),rhs(x4dot_def));   
% substitute q2_dot --> x4
deq1_in_xuz = subs(deq1_in_xuz,lhs(x4_def),rhs(x4_def));         
deq2_in_xuz = subs(deq2_in_xuz,lhs(x4_def),rhs(x4_def));         
% substitute q2 --> x3
deq1_in_xuz = subs(deq1_in_xuz,lhs(x3_def),rhs(x3_def));          
deq2_in_xuz = subs(deq2_in_xuz,lhs(x3_def),rhs(x3_def));
% Substitute control input 
deq1_in_xuz = subs(deq1_in_xuz,lhs(udef),rhs(udef));
deq2_in_xuz = subs(deq2_in_xuz,lhs(udef),rhs(udef));
% Substitute disturbance input
deq1_in_xuz = subs(deq1_in_xuz,lhs(zdef),rhs(zdef));
deq2_in_xuz = subs(deq2_in_xuz,lhs(zdef),rhs(zdef));
%% 
% Final equations of motions after substitutions:

deq1_in_xuz
deq2_in_xuz
% Solve for time derivatives of the states and determine state differential equation
% These two resulting equations of motion and the two trivial state differential 
% equations
% 
% $$\begin{array}{l}\dot{\;x_1 } =x_2 \\\dot{\;x_3 } =x_4 \end{array}$$
% 
% together form a system of four equations. Solving this system of equations 
% for the time derivatives$\dot{\;x_1 } ,\dot{\;x_2 } ,\dot{\;x_3 }$ and $\dot{x_4 
% }$ results in the vector function $\underline{f} \left(\underline{x} ,u,z\right)$ 
% which defines the right-hand side of the state differential equation $\underline{\dot{x} 
% } =\underline{f} \left(\underline{x} ,u,z\right)$:

% solve system of equations for first-order time derivatives of the states
aux=solve([x1dot_def,deq1_in_xuz,x3dot_def,deq2_in_xuz],[x1dot,x2dot,x3dot,x4dot]);
% combine solutions to the vector function f(x,u,z)
f=simplify([x1dot;x2dot;x3dot;x4dot])
% Define measured signals as output variables
% The ball position on the beam $x_{\textrm{ball}}$ and the beam angle $\beta_{\textrm{beam}}$ 
% are measured such that these two signals are specified as outputs $y_1$ and 
% $y_2$ of the system. Since the states $x_1$ and $x_3$ are defined according 
% to 
% 
% $$\begin{array}{l}x_1 =q_1 =x_{\textrm{ball}} \\x_3 =q_2 =\beta_{\textrm{beam}} 
% \end{array}$$
% 
% the output variables can easily be expressed as functions of the states:
% 
% $$\begin{array}{l}y_1 =x_1 \\y_2 =x_3 \end{array}$$
% 
% With the vector function

h=[x1(t);-r_ball*x3(t)]
%% 
% the output equation can alternatively be written in vector form as $\underline{y} 
% =\underline{h} \left(\underline{x} ,u,z\right)=\left\lbrack \begin{array}{c}x_1 
% \\x_3 \end{array}\right\rbrack$.
%% Summary: Final State Equations of the Ball-on-beam System

displayFormula('diff(x(t),t)==f')
displayFormula('y(t)==h')
%% References
%% 
% # Kamman, James, "An Introduction to Three-Dimensional Rigid Body Dynamics", 
% ebook, <https://kamman-dynamics-control.org/3d-dynamics-ebook/ https://kamman-dynamics-control.org/3d-dynamics-ebook/> 
% (accessed November 6, 2023)