# Profile Photos

Add your LinkedIn profile photos to this folder.

## Instructions:

1. Add your profile photo images to this folder
2. Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
3. Images will be automatically cropped to a circle
4. Recommended size: Square images (e.g., 400x400px or larger) work best

## How to use:

After adding images to this folder, update the `getProfilePhotoList()` function in `game.js` to include your image filenames.

Example:
```javascript
getProfilePhotoList() {
    return [
        'photo1.jpg',
        'photo2.jpg',
        'photo3.jpg',
        // Add more filenames here
    ];
}
```

The game will randomly assign these photos to conversations. If no photos are available, it will fall back to colored gradient placeholders.

