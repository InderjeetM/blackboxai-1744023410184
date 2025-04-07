// Firebase Configuration (Replace with your actual config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebase.database();

// ===== ADMIN UPLOAD FUNCTIONALITY ===== //
async function uploadFiles() {
  const files = document.getElementById('file-input').files;
  const category = document.getElementById('category').value;
  const itemName = document.getElementById('item-name').value;

  if (files.length === 0 || !itemName) {
    alert("Please select files and enter an item name!");
    return;
  }

  // Show progress container
  document.getElementById('progress-container').classList.remove('hidden');
  const progressList = document.getElementById('progress-list');
  progressList.innerHTML = '';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const itemId = `item_${Date.now()}_${i}`;
    const storagePath = `${category}/${itemId}`;
    
    // Upload to Firebase Storage
    const uploadTask = storage.ref(storagePath).put(file);

    // Create progress item
    const progressItem = document.createElement('div');
    progressItem.className = 'border-b pb-2';
    progressItem.innerHTML = `
      <p class="font-medium">${file.name}</p>
      <div class="h-2 bg-gray-200 rounded mt-1">
        <div id="progress-${i}" class="h-full bg-blue-500 rounded" style="width: 0%"></div>
      </div>
    `;
    progressList.appendChild(progressItem);

    // Track upload progress
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        document.getElementById(`progress-${i}`).style.width = `${progress}%`;
      },
      (error) => {
        alert(`Error uploading ${file.name}: ${error.message}`);
      },
      async () => {
        // Upload complete - save metadata
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        await db.ref(`outfit_items/${itemId}`).set({
          name: itemName,
          category: category,
          imageUrl: downloadURL,
          uploadedAt: firebase.database.ServerValue.TIMESTAMP
        });
        document.getElementById(`progress-${i}`).classList.add('bg-green-500');
      }
    );
  }
}

// ===== CUSTOMER TRY-ON FUNCTIONALITY ===== //
// (Include all the customer-facing functions we developed earlier)
let faceModel;
async function loadFaceModel() {
  faceModel = await blazeface.load();
}

async function detectFaceAndOverlay() {
  // (Include the face detection and overlay logic)
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
  loadFaceModel();
  // Load initial outfit items
  loadOutfitItems();
});