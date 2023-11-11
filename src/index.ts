import Cropper from 'cropperjs';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const imagesInput = document.getElementById('images-input') as HTMLInputElement;
const croppingDiv = document.getElementById('images');
const downloadCroppedButton = document.getElementById('download-cropped');
const downloadContextButton = document.getElementById('download-context');
const cropWidthInput = <HTMLInputElement>document.getElementById('crop-width');
const cropHeightInput = <HTMLInputElement>document.getElementById('crop-height');

let croppers: Array<{ cropper: Cropper; imgName: string }> = [];

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
      zoomable: false,
      responsive: false,
      minContainerWidth: preview.offsetWidth,
      minContainerHeight: preview.offsetWidth,
    });
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '180';
    slider.value = '0';
    slider.addEventListener('input', () => cropper.setData({ rotate: parseInt(slider.value) }));

    croppers.push({ cropper, imgName: file.name });
    listItem.appendChild(img);
    listItem.appendChild(slider);
    list.appendChild(listItem);
  }
};

const updateCropSize = () => {
  console.log(cropHeightInput.value);
  for (const cropper of croppers) {
    cropper.cropper.setData({
      width: parseInt(cropWidthInput.value),
      height: parseInt(cropHeightInput.value),
    });
  }
};

const downloadCropped = () => {
  const zip = new JSZip();
  for (let i = 0; i < croppers.length; i++) {
    croppers[i].cropper.getCroppedCanvas().toBlob((blob) => {
      if (!blob) {
        return;
      }
      zip.file(`${croppers[i].imgName}.png`, blob);
      if (i === croppers.length - 1)
        zip
          .generateAsync({
            type: 'blob',
          })
          .then(function (content) {
            saveAs(content, 'cropped.zip');
          });
    });
  }
};

const downloadContext = () => {};

if (imagesInput && croppingDiv && downloadCroppedButton && downloadContextButton) {
  cropWidthInput.addEventListener('change', updateCropSize);
  cropHeightInput.addEventListener('change', updateCropSize);

  imagesInput.value = '';
  imagesInput.addEventListener('change', updateImagesToDisplay(croppingDiv, imagesInput));
  console.log('setup successfull');

  downloadCroppedButton.addEventListener('click', downloadCropped);
  downloadContextButton.addEventListener('click', downloadContext);
  downloadContextButton.setAttribute('style', 'display: none;');
}
