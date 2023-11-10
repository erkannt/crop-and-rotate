import Cropper from 'cropperjs';

const imagesInput = document.getElementById('images-input') as HTMLInputElement;
const croppingDiv = document.getElementById('images');
const cropWidthInput = <HTMLInputElement>document.getElementById('crop-width');
const cropHeightInput = <HTMLInputElement>document.getElementById('crop-height');

let croppers: Array<Cropper> = [];

const updateImagesToDisplay = (preview: HTMLElement, images: HTMLInputElement) => () => {
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild);
  }
  croppers = [];
  const curFiles = images.files;

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
    const cropper = new Cropper(img, {
      cropBoxResizable: false,
      data: {
        width: parseInt(cropWidthInput.value),
        height: parseInt(cropHeightInput.value),
      },
      dragMode: 'none',
      scalable: false,
      zoomable: false,
    });
    croppers.push(cropper);
    listItem.appendChild(img);
    list.appendChild(listItem);
  }
};

const updateCropSize = () => {
  console.log(cropHeightInput.value);
  for (const cropper of croppers) {
    cropper.setData({
      width: parseInt(cropWidthInput.value),
      height: parseInt(cropHeightInput.value),
    });
  }
};

if (imagesInput && croppingDiv) {
  cropWidthInput.addEventListener('change', updateCropSize);
  cropHeightInput.addEventListener('change', updateCropSize);

  imagesInput.value = '';
  imagesInput.addEventListener('change', updateImagesToDisplay(croppingDiv, imagesInput));
  console.log('setup successfull');
}
