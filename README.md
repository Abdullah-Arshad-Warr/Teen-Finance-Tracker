# Teen-Finance-Tracker

Teen-Finance-Tracker is a simple web application designed to help teenagers track their income, expenses, and savings. The app provides an easy-to-use interface for managing personal finances and visualizing spending habits.

## Features
- Add, edit, and delete income and expense entries
- View a summary of total income, expenses, and balance
- Visualize spending with charts 
- Add saving goals
- Read financial literacy Articles
- Play trivia on financial knowledge
- Responsive and user-friendly interface

## Technologies Used
- Python (Flask)
- HTML, CSS, JavaScript

## Getting Started

### Prerequisites
- Python 3.10 or higher
- pip (Python package manager)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Abdullah-Arshad-Warr/Teen-Finance-Tracker.git
   cd Teen-Finance-Tracker
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install flask
   ```


### Setup: Gemini API Key

This project requires a Gemini API key to run. Follow these steps:

1. **Get your Gemini API key**
   - Go to the [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Sign in with your Google account.
   - Click **Create API key** and copy it.

2. **Add the API key to your environment file**
   - In the root of your project, create a `.env` file (if it doesn’t exist).
   - Add the following line, replacing `your_api_key_here` with the key you copied:

     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Load environment variables**
   - The project will automatically read the key from your `.env` file.
   - Make sure you **never commit your `.env` file** to GitHub.  

### Running the App
1. Start the Flask server:
   ```bash
   python app.py
   ```
2. Open your browser and go to `http://127.0.0.1:5000/`

## Project Structure
```
├── app.py
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── templates/
│   └── index.html
└── README.md
```

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.

## Credits
Created by Abdullah Arshad Warr in collaboration with Mughees Ali.