import csv
import json
from typing import Dict, Any
from fuzzywuzzy import process

# Define the valid options
VALID_DEFECT_NAMES = {
    "Loose Wiring",  # Common typo included for correction
    "Loose Wiring",
    "Hydraulic Leak",
    "Faulty Battery",
    "Sensor Failure",
    "Cracked Windshield",
    "Paint Scratch",
    "Brake Malfunction"
}

VALID_STATIONS = {
    "Tire and rim installation",
    "Dashboard installation",
    "Second row seats installation",
    "Rear bumper installation",
    "Wire harness installation",
    "EV battery installation",
    "Steering wheel installation",  # Common typo included
    "Steering wheel installation",
    "Axle installation",
    "Headlight installation",
    "First row seats installation",
    "Windshield installation"
}

# Header mapping
HEADER_MAPPING = {
    "Date": "date",
    "Time": "time",
    "Defect Name": "defectName",
    "Station": "station",
    "Part of the Car": "partOfCar",
    "Reporter Name": "reporterName",
    "Part Number": "partNumber",
    "Severity Rating": "severityRating",
    "Car Model": "carModel",
    "Motor Type": "motorType",
    "Design Package": "designPackage",
    "Production Shift": "productionShift",
    "Resolution Time (in hours)": "resolutionTimeHours",
    "Root Cause Identified": "rootCauseIdentified",
    "Defect Category": "defectCategory"
}

def find_closest_match(value: str, valid_options: set, threshold: int = 80) -> str:
    """Find the closest match using fuzzy string matching."""
    if not value or not isinstance(value, str):
        return value
    
    # Try exact case-insensitive match first (faster)
    lower_value = value.lower()
    for option in valid_options:
        if option.lower() == lower_value:
            return option
    
    # If no exact match, use fuzzy matching
    best_match, score = process.extractOne(value, valid_options)
    if score >= threshold:  # Only correct if similarity is high enough
        print(f"Corrected '{value}' to '{best_match}' (confidence: {score}%)")
        return best_match
    return value  # Return original if no good match found

def validate_and_correct_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and correct spelling in the record."""
    # Correct defectName if needed
    if "defectName" in record:
        record["defectName"] = find_closest_match(record["defectName"], VALID_DEFECT_NAMES)
    
    # Correct station if needed
    if "station" in record:
        record["station"] = find_closest_match(record["station"], VALID_STATIONS)
    
    # Convert severityRating and resolutionTimeHours to integers if they're strings
    if "severityRating" in record and isinstance(record["severityRating"], str):
        try:
            record["severityRating"] = int(record["severityRating"])
        except ValueError:
            pass  # Keep as string if conversion fails
    
    if "resolutionTimeHours" in record and isinstance(record["resolutionTimeHours"], str):
        try:
            record["resolutionTimeHours"] = int(record["resolutionTimeHours"])
        except ValueError:
            pass
    
    return record

def csv_to_json(csv_file_path: str, json_file_path: str) -> None:
    """Convert CSV to JSON with validation and correction."""
    data = []
    
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        # Read CSV and map headers
        csv_reader = csv.DictReader(csv_file)
        
        for row in csv_reader:
            # Map headers according to HEADER_MAPPING
            mapped_row = {}
            for csv_header, json_key in HEADER_MAPPING.items():
                if csv_header in row:
                    mapped_row[json_key] = row[csv_header]
            
            # Validate and correct data
            validated_row = validate_and_correct_record(mapped_row)
            data.append(validated_row)
    
    # Write to JSON file
    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    # Define your file paths
    csv_path = r"D:\bmw-quality-dashboardN\src\data\defects.csv"
    json_path = r"D:\bmw-quality-dashboardN\src\data\defects_corrected.json"
    
    # Perform the conversion
    print(f"Processing CSV file: {csv_path}")
    csv_to_json(csv_path, json_path)
    print(f"Conversion complete. Corrected JSON saved to: {json_path}")