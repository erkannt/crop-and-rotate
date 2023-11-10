import Cropper from 'cropperjs';

const imagesInput = document.getElementById('images-input') as HTMLInputElement;
const croppingDiv = document.getElementById('images');
const cropWidthInput = <HTMLInputElement>document.getElementById('crop-width');
const cropHeightInput = <HTMLInputElement>document.getElementById('crop-height');

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
    new Cropper(img, {
      cropBoxResizable: false,
      data: {
        width: parseInt(cropWidthInput.value),
        height: parseInt(cropHeightInput.value),
      },
      dragMode: 'none',
      scalable: false,
      zoomable: false,
    });

    listItem.appendChild(img);

    list.appendChild(listItem);
  }
};

if (imagesInput && croppingDiv) {
  imagesInput.addEventListener('change', updateImagesToDisplay(croppingDiv, imagesInput));
  imagesInput.value = '';
  console.log('setup successfull');
}
