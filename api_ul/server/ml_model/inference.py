import sys
import cv2
import numpy as np
import joblib
from urllib.request import urlopen
from skimage.feature import local_binary_pattern

# Feature extraction (same as training)
def extract_features(image):
    image = cv2.resize(image, (128, 128))

    hsv_img = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv_img], [0, 1, 2], None, (8, 8, 8), [0, 180, 0, 256, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()

    gray_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    lbp = local_binary_pattern(gray_img, P=8, R=1, method='uniform')
    lbp_hist, _ = np.histogram(lbp.ravel(), bins=np.arange(0, 10), range=(0, 9))
    lbp_hist = lbp_hist.astype("float")
    lbp_hist /= (lbp_hist.sum() + 1e-6)

    return np.concatenate([hist, lbp_hist])

# Main entry
def main():
    url = sys.argv[1]  # Get image URL as input
    resp = urlopen(url) #This line attempts to open the URL provided by the user.
    image_data = np.asarray(bytearray(resp.read()), dtype="uint8") # This is where the image content is read and prepared for OpenCV.
    image = cv2.imdecode(image_data, cv2.IMREAD_COLOR) #This is the OpenCV part

    model = joblib.load("ml_model/mlp_color_texture.pkl") #The filename. .pkl is a common extension for files saved with pickle or joblib. 
    #mlp likely stands for Multi-Layer Perceptron (a type of neural network), 
    # and color_texture suggests that the model was trained using features related to color and texture from images.
    features = extract_features(image).reshape(1, -1)
    prediction = model.predict(features)
    proba = model.predict_proba(features).max()

    print(f"{prediction[0]}|{proba:.2f}")  # Output: predicted_label|confidence

if __name__ == "__main__":
    main()
