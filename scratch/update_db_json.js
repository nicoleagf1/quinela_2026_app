const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../ia_mock_db.json');
if (fs.existsSync(dbPath)) {
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  if (data.matches) {
    data.matches = data.matches.map(match => {
      if (!match.hasOwnProperty('prediction_deadline')) {
        match.prediction_deadline = null;
      }
      return match;
    });
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Successfully updated ia_mock_db.json with prediction_deadline fields.');
  } else {
    console.log('No matches found in ia_mock_db.json.');
  }
} else {
  console.log('ia_mock_db.json not found.');
}
