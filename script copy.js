import { ref, uploadBytes } from 'firebase/storage';

const storageRef = ref(storage, 'images/my-image.jpg');
uploadBytes(storageRef, file)
  .then((snapshot) => {
    console.log('Uploaded file:', snapshot.ref);
  })
  .catch((error) => {
    console.error('Error uploading file:', error);
  });
