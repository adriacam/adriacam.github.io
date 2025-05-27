#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

// Function to calculate median of three values
int calculateMedian(const std::vector<int>& values) {
    if (values.size() < 3) return 0;
    
    // Create a copy and sort it
    std::vector<int> sortedValues(values.end() - 3, values.end());
    std::sort(sortedValues.begin(), sortedValues.end());
    
    // Return the middle element (median of 3 elements)
    return sortedValues[1];
}

int main() {
    // Replace with your actual file path
    std::string filePath = "C:/Users/acamm/Desktop/sensor_readings.txt";
    std::ifstream inputFile(filePath);
    
    if (!inputFile.is_open()) {
        std::cerr << "Error opening file: " << filePath << std::endl;
        return 1;
    }
    
    std::string line;
    int validReadingsCount = 0;
    int skippedZeroReadings = 0;
    int discardedReadings = 0;  // Counter for discarded outlier readings
    
    // Vector to store the last 3 valid readings
    std::vector<int> recentReadings;
    
    while (std::getline(inputFile, line)) {
        try {
            // Find the position of "Distance:" in the line
            size_t pos = line.find("Distance:");
            if (pos == std::string::npos) {
                std::cout << "Skipping invalid line format: " << line << std::endl;
                continue;
            }
            
            // Extract the part after "Distance:"
            std::string distanceStr = line.substr(pos + 9); // "Distance:" is 9 characters
            
            // Remove the "mm" suffix if it exists
            size_t mmPos = distanceStr.find("mm");
            if (mmPos != std::string::npos) {
                distanceStr = distanceStr.substr(0, mmPos);
            }
            
            // Parse the distance value
            int Distance = std::stoi(distanceStr);
            
            // Skip zero readings
            if (Distance == 0) {
                skippedZeroReadings++;
                continue; // Skip to the next reading
            }
            
            // Check if the reading is reasonable based on recent readings
            if (recentReadings.size() >= 3) {
                // Calculate median of last 3 readings
                int median = calculateMedian(recentReadings);
                
                // Check if current reading deviates by more than 100mm
                if (std::abs(Distance - median) > 50) {
                    std::cout << "Discarding outlier: " << Distance 
                              << "mm (median of last 3: " << median << "mm)" << std::endl;
                    discardedReadings++;
                    continue; // Skip this reading
                }
            }
            
            // Apply the filter logic from your original code
            if (Distance >= 495 && Distance <= 505) {
                // This would be digitalWrite(LED_BUILTIN, HIGH) in Arduino
                std::cout << "LED ON: ";
                std::cout << "Stop. You are at 50cm +-5cm from seabed." << std::endl;
                validReadingsCount++;
            }
            else if (Distance >= 295 && Distance <= 305) {
                // This would be digitalWrite(LED_BUILTIN, HIGH) in Arduino
                std::cout << "LED ON: ";
                std::cout << "Stop. You are at 30cm +-5cm from seabed." << std::endl;
                validReadingsCount++;
            }
            else {
                // This would be digitalWrite(LED_BUILTIN, LOW) in Arduino
                std::cout << "LED OFF: ";
                std::cout << "Outside target range: " << Distance << std::endl;
            }
            
            // Add this reading to recent readings
            recentReadings.push_back(Distance);
            
            // Keep only the most recent 3 readings
            if (recentReadings.size() > 3) {
                recentReadings.erase(recentReadings.begin());
            }
        }
        catch (std::exception& e) {
            std::cout << "Skipping invalid line: " << line << std::endl;
        }
    }
    
    inputFile.close();
    
    std::cout << "\nSummary:" << std::endl;
    std::cout << "Total readings in range: " << validReadingsCount << std::endl;
    std::cout << "Skipped zero readings: " << skippedZeroReadings << std::endl;
    std::cout << "Discarded outlier readings: " << discardedReadings << std::endl;
    
    return 0;
}