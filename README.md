# Poppy Seed Adulteration Detection (PoppyPure)

---

## Introduction

This project, named **PoppyPure**, aims to combat food adulteration by developing an advanced system for detecting and quantifying foreign substances in poppy seeds. Leveraging the power of image processing and machine learning, PoppyPure provides a reliable, efficient, and scalable solution to ensure food quality and consumer trust.

## Problem Statement

Poppy seeds are a valuable commodity often targeted for adulteration with cheaper substitutes like semolina due to their similar appearance. This practice poses significant challenges for visual inspection, leading to:
- **Health Risks:** Nutritional dilution, exposure to toxic substances, allergic reactions, digestive issues, and physical hazards.
- **Economic Impact:** Loss of consumer trust and reduced market demand for genuine products.
- **Detection Difficulty:** Traditional manual inspection methods are subjective, time-consuming, and not scalable.

Our project specifically addresses the detection of **semolina adulteration in poppy seeds** through an automated, image-based approach.

## Key Features

* **Accurate Adulteration Detection:** Utilizes machine learning to precisely classify and quantify adulteration percentages.
* **Image-Based Analysis:** Employs advanced image processing techniques to extract crucial visual features.
* **User-Friendly Web Application:** Provides an intuitive interface for image uploads and instant adulteration predictions.
* **Secure User Authentication:** Implements robust login/registration with `Bcrypt` and `JWT`.
* **Personalized History:** Users can view a record of their previous image uploads and analysis results.
* **Scalable Cloud Infrastructure:** Deployed on cloud platforms for reliable access and performance.

## Methodology

Our project follows a comprehensive machine learning pipeline, from meticulous data handling to robust model deployment.

### Data Acquisition & Preprocessing

* **Curated Dataset:** A proprietary dataset of high-resolution images was created, including:
    * Pure poppy seeds and pure semolina.
    * Mixtures with precise adulteration percentages (0%, 10%, 20%, 30%, 40%, 50%, 100%).
    * Images captured under diverse conditions (black and white backgrounds, varying magnifications like 4x and microscopic views) to ensure robustness.
* **Preprocessing Steps:**
    * **Resizing:** Images uniformly scaled to 128x128 pixels.
    * **Normalization:** Pixel values scaled to a 0-1 range.
    * **Noise Reduction:** Techniques applied to smooth out irrelevant variations (specific techniques not explicitly detailed in provided code, but mentioned in report).

### Feature Engineering & Selection

To translate images into machine-readable data, we performed extensive feature engineering:
* **Initial Exploration:** Extracted a broad spectrum of features including statistical (mean, variance, entropy), texture (GLCM, LBP), color (RGB Histograms), and edge features.
* **Feature Selection:** Employed rigorous methods like **Correlation Matrix Analysis** (to identify and prune redundant features) and **Mutual Information (MI) analysis** (to rank features based on their non-linear dependency to adulteration levels).
* **Final Optimized Feature Set:** Converged on highly discriminative features:
    * **Color Histograms (HSV space):** Excellent for capturing color distribution differences.
    * **Local Binary Patterns (LBP):** Robust for characterizing fine-grained textural distinctions.

### Model Selection & Training

A thorough evaluation of various machine learning models was conducted to identify the most effective solution:
* **Models Explored:**
    * 2D Convolutional Neural Network (Custom)
    * Prototypical Network
    * Random Forest Classifier
    * ResNet 50 (for feature extraction) + PCA + Multi-Layer Perceptron (MLP)
    * Multi-Layer Perceptron (MLP) Classifier
* **Dataset Split:** The dataset was split into 70% for training, 15% for validation, and 15% for independent testing, using **Stratified Sampling** to maintain class distribution.
* **Final Model Choice:** The **Multi-Layer Perceptron (MLP) Classifier** was selected. It demonstrated the optimal balance of high accuracy and robust generalization when combined with our engineered Color Histogram and LBP features. While ResNet+MLP achieved higher training accuracy, it suffered from severe overfitting, making the MLP a more reliable choice for real-world application.
* **Optimization:** The MLP was trained using the Adam optimizer with ReLU activation and L2 regularization to minimize loss and ensure generalizable patterns.

### Model Performance

The MLP Classifier achieved excellent results:
* **Overall Accuracy:** ~89.19%
* **Weighted Average F1-Score:** ~0.89

The confusion matrix showed strong diagonal values, indicating precise classification across all adulteration levels.

## System Architecture & Deployment

The project is deployed as a full-stack web application:

* **Frontend:** Built with **React.js**.
* **Backend:** Developed using **Node.js** and **Express.js**.
* **Database:** **MongoDB** (NoSQL database) for storing user data and history.
* **Backend API Deployment:** Hosted on **Render** (server-side).
* **Client-side Deployment:** Hosted on **Netlify**.
* **ML Integration:** Python model (`joblib`-saved) is integrated with the Node.js backend using `Python-shell` to execute prediction scripts.
* **File Uploads:** Handled by `Multer` middleware.
* **Cloud Storage:** User-uploaded images are stored on **Cloudinary**.

## Future Scope

The project has a robust foundation and numerous exciting avenues for future development:
* **Model Accuracy Enhancement:** Explore advanced feature engineering (e.g., Wavelet transforms), fine-tune deep learning models (ResNet, EfficientNet) with better regularization, and implement advanced ensemble techniques (XGBoost, LightGBM).
* **Enhanced Web Application:** Implement real-time processing indicators, detailed analysis reports with feature visualizations, user feedback mechanisms, and multi-language support.
* **Mobile Application Development:** Create native Android/iOS apps with on-device image capture and optimized Edge AI for faster, offline detection.
* **Broader Applicability & Advanced Functionalities:** Extend detection to other adulterants in poppy seeds or other food items, integrate with IoT devices for automated inspection, and explore blockchain technology for supply chain transparency.

## Getting Started

To set up and run this project locally, follow these general steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shadesin/PoppyPure.git
    cd PoppyPure
    ```
2.  **Backend Setup:**
    * Navigate to the backend directory.
    * Install Node.js dependencies: `npm install`
    * Set up environment variables for MongoDB connection, Cloudinary API keys, JWT secret, etc. (e.g., in a `.env` file).
    * Ensure Python environment is set up with required ML libraries (`scikit-learn`, `numpy`, `opencv-python`, `scikit-image`, `tensorflow`, `joblib`, `pandas`).
    * Place your trained `mlp_color_texture.pkl` (or equivalent) model and `label_encoder.pkl` files in the designated backend directory for the prediction script.
    * Start the backend server: `npm start` (or `node server.js`).
3.  **Frontend Setup:**
    * Navigate to the frontend directory.
    * Install React dependencies: `npm install`
    * Configure API endpoint (pointing to your local backend server or deployed backend).
    * Start the React development server: `npm start`

## Contact

For any inquiries or collaborations, feel free to reach out to the project team:

* Souradeep Das - dsouradeep.117@gmail.com
* Adipto Ray
* Debayan Dhar
* Hardik Patra
* Mayukh Biswas

---
