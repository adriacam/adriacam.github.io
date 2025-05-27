clc; clear;
addpath('C:\Users\acamm\Desktop\MATLAB');
[data, names] = load_traces('JLoadAndFriciton.trace');

% Convert time to seconds
time = data(:,1) / 1000;

% Convert angular speed to radians per second (SI units)
omega = data(:,2);

% Convert current to amperes (SI units)
current = data(:,3);

% Calculate angular acceleration in rad/s^2
angularacc = num_derivative(omega, time);

% Calculate torque constant for the given current
kT = torqueconstant(current);

% Calculate motor torque in Nm
mt = kT .* current;

% Plotting results in one figure with four subplots
figure;

% Plot angular speed
subplot(4, 1, 1);
plot(time, omega);
xlabel('Time (s)');
ylabel('Angular Speed (rad/s)');
title('Angular Speed ω(t)');

% Plot angular acceleration
subplot(4, 1, 2);
plot(time, angularacc);
xlabel('Time (s)');
ylabel('Angular Acceleration (rad/s^2)');
title('Angular Acceleration α(t)');

% Plot motor torque
subplot(4, 1, 3);
plot(time, mt);
xlabel('Time (s)');
ylabel('Motor Torque (Nm)');
title('Motor Torque Mmotor(t)');

% Plot current
subplot(4, 1, 4);
plot(time, current);
xlabel('Time (s)');
ylabel('Current (A)');
title('Current I(t)');

% Function to calculate numerical derivative (angular acceleration)
function alpha = num_derivative(omega, t)
    % Check if the time vector is provided
    if nargin < 2
        % If time vector is not provided, assume uniform time steps with dt = 1
        dt = 1;
    else
        % Calculate time steps from the time vector
        dt = diff(t);
        % Ensure dt is consistent across all steps
        if any(abs(diff(dt)) > 1e-6)  % Allow small numerical errors
            error('Time steps are not consistent. Please provide a uniform time vector.');
        end
        dt = dt(1);  % Use the first time step
    end
    
    % Calculate numerical derivative using central differences
    alpha = zeros(size(omega));  % Initialize the output array
    alpha(2:end-1) = (omega(3:end) - omega(1:end-2)) / (2 * dt);  % Central difference
    % For the boundaries, use forward and backward differences
    alpha(1) = (omega(2) - omega(1)) / dt;  % Forward difference for the first point
    alpha(end) = (omega(end) - omega(end-1)) / dt;  % Backward difference for the last point
end

% Function to calculate the torque constant
function kT = torqueconstant(Iq)
    % Given data
    M0 = 1.4;       % Continuous stall torque (Nm)
    I0 = 1.8;       % Continuous stall current (A)
    Mmax = 3.5;     % Peak torque (Nm)
    Imax = 5.7;     % Peak current (A)

    % Solve the linear system to find coefficients
    A = [I0^3, I0; Imax^3, Imax];
    B = [M0; Mmax];
    coefficients = A\B;
    a = coefficients(1);
    c = coefficients(2);
    disp(a);
    disp(c);

    % Define the torque constant function
    kT = a * Iq.^2 + c;
end
