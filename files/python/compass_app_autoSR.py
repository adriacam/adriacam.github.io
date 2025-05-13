import math
import matplotlib.pyplot as plt

# Earth's radius in meters
EARTH_RADIUS = 6371000

def compute_heading(lat1, lon1, lat2, lon2):
    """
    Compute bearing from point 1 to point 2 in degrees.
    heading = atan2(Δlon, Δlat)
    """
    dlon = math.radians(lon2 - lon1)
    dlat = math.radians(lat2 - lat1)
    heading = math.degrees(math.atan2(dlon, dlat))
    return heading % 360


def compute_horizontal_distance(lat1, lon1, lat2, lon2):
    """
    Compute the ground (great-circle) distance between two lat/lon points using the haversine formula.
    Returns distance in meters.
    """
    φ1, φ2 = math.radians(lat1), math.radians(lat2)
    Δφ = φ2 - φ1
    Δλ = math.radians(lon2 - lon1)
    a = math.sin(Δφ/2)**2 + math.cos(φ1) * math.cos(φ2) * math.sin(Δλ/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return EARTH_RADIUS * c


def compute_slant_range(lat1, lon1, alt1, lat2, lon2, alt2):
    """
    Compute straight-line (slant) distance between two points with altitude.
    Uses haversine for horizontal then Pythagoras with altitude difference.
    """
    horizontal = compute_horizontal_distance(lat1, lon1, lat2, lon2)
    alt_diff = alt2 - alt1
    return math.hypot(horizontal, alt_diff)


def compute_elevation(alt_diff, slant_range):
    """
    Compute elevation angle in degrees: elevation = atan2(alt_diff, slant_range)
    """
    return math.degrees(math.atan2(alt_diff, slant_range))


def plot_compass(heading, elevation):
    """
    Display a compass rose with an arrow at the given heading,
    and show numeric heading and elevation on the plot.
    """
    fig = plt.figure(figsize=(6,6))
    ax = fig.add_subplot(111, projection='polar')
    ax.set_theta_zero_location('N')
    ax.set_theta_direction(-1)

    ax.plot([math.radians(heading), math.radians(heading)], [0, 1], linewidth=3)
    ax.set_yticks([])
    ax.set_xticks([0, math.pi/2, math.pi, 3*math.pi/2])
    ax.set_xticklabels(['N', 'E', 'S', 'W'])
    ax.set_title(f"Heading: {heading:.2f}° | Elevation: {elevation:.2f}°", va='bottom')

    plt.tight_layout()
    plt.show()


def main():
    # User inputs
    lat1 = float(input('Observer latitude (°): '))
    lon1 = float(input('Observer longitude (°): '))
    alt1 = float(input('Observer altitude (m): '))
    lat2 = float(input('Target latitude (°): '))
    lon2 = float(input('Target longitude (°): '))
    alt2 = float(input('Target altitude (m): '))

    # Calculations
    heading = compute_heading(lat1, lon1, lat2, lon2)
    slant = compute_slant_range(lat1, lon1, alt1, lat2, lon2, alt2)
    elevation = compute_elevation(alt2 - alt1, slant)

    # Output numeric values
    print(f"\nComputed Heading: {heading:.2f}°")
    print(f"Computed Slant Range: {slant:.2f} m")
    print(f"Computed Elevation: {elevation:.2f}°\n")

    # Display compass
    plot_compass(heading, elevation)

if __name__ == '__main__':
    main()
