import Cropper from 'cropperjs';

const updateImagesToDisplay = (preview: HTMLElement, images: HTMLInputElement) => () => {
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild);
  }
  const curFiles = images.files;
  console.log(curFiles);

  if (!curFiles) {
    return;
  }

  if (curFiles.length === 0) {
    return;
  }

  const list = document.createElement('ol');
  preview.appendChild(list);

  for (const file of curFiles) {
    const listItem = document.createElement('li');
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    new Cropper(img);

    listItem.appendChild(img);

    list.appendChild(listItem);
  }
};

const images = document.getElementById('images-input') as HTMLInputElement;
const preview = document.getElementById('images');

if (images && preview) {
  images.addEventListener('change', updateImagesToDisplay(preview, images));
  images.value = '';
  console.log('setup successfull');
}
