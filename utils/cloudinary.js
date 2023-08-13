import { v2 as cloudinary } from 'cloudinary'


cloudinary.config({ 
    cloud_name: 'dmgy5y8ec', 
    api_key: '733266495152475', 
    api_secret: 'm_r6goAgVkQ0j8gTkyJhkOFLjYY' 
  });

  export const uploadImage = async (file, segment, identifier) => {
    return new Promise((resolve, reject) => {
      if (!file || typeof file !== 'string' || !file.startsWith('data:image')) {
        return reject({ message: 'Invalid image format' });
      }

      const path = `${segment}/${identifier}`;
      cloudinary.uploader.upload(file, { folder: path }, (error, result) => {
        if (result && result.secure_url) {
          return resolve(result.secure_url);
        }
        console.log("Error uploading image:", error.message);
        return reject({ message: error.message });
      });
    });
}
  
  // Function to upload multiple images
  export const uploadMoreImages = (images, segment, identifier) => {
    return new Promise((resolve, reject) => {
      const uploads = images.map(async (base) => uploadImage(base, segment, identifier));
      Promise.all(uploads).then(values => resolve(values)).catch((err) => reject(err));
    })
  }



export default cloudinary