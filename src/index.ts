import Cropper from 'cropperjs';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const elems = {
  imagesInput: document.getElementById('images-input') as HTMLInputElement,
  croppingDiv: document.getElementById('images'),
  downloadCroppedButton: document.getElementById('download-cropped'),
  downloadContextButton: document.getElementById('download-context'),
  cropWidthInput: <HTMLInputElement>document.getElementById('crop-width'),
  cropHeightInput: <HTMLInputElement>document.getElementById('crop-height'),
};

let imgs: Array<{ cropper: Cropper; filename: string; imgElement: HTMLImageElement }> = [];

const updateImagesToDisplay = (preview: HTMLElement, images: HTMLInputElement) => () => {
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild);
  }
  imgs = [];
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
        width: parseInt(elems.cropWidthInput.value),
        height: parseInt(elems.cropHeightInput.value),
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

    imgs.push({ cropper, filename: file.name, imgElement: img });
    listItem.appendChild(img);
    listItem.appendChild(slider);
    list.appendChild(listItem);
  }
};

const updateCropSize = () => {
  for (const cropper of imgs) {
    cropper.cropper.setData({
      width: parseInt(elems.cropWidthInput.value),
      height: parseInt(elems.cropHeightInput.value),
    });
  }
};

const downloadCropped = () => {
  const zip = new JSZip();
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].cropper.getCroppedCanvas().toBlob((blob) => {
      if (!blob) {
        return;
      }
      zip.file(`${imgs[i].filename}.png`, blob);
      if (i === imgs.length - 1)
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

const downloadContext = () => {
  const img = imgs[0].imgElement;

  const data = {
    container: imgs[0].cropper.getContainerData(),
    canvas: imgs[0].cropper.getCanvasData(),
    image: imgs[0].cropper.getImageData(),
    crop: imgs[0].cropper.getCropBoxData(),
  };

  const canvas = document.createElement('canvas');
  canvas.width = data.container.width;
  canvas.height = data.container.height;
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }
  const centerDeltaX = data.container.width / 2;
  const centerDeltaY = data.container.height / 2;
  context.translate(centerDeltaX, centerDeltaY);
  context.rotate((data.image.rotate * Math.PI) / 180);
  context.drawImage(
    img,
    0,
    0,
    img.naturalWidth,
    img.naturalHeight,
    data.image.left + data.canvas.left - centerDeltaX,
    data.image.top + data.canvas.top - centerDeltaY,
    data.image.width,
    data.image.height,
  );
  context.rotate(-(data.image.rotate * Math.PI) / 180);
  context.translate(-centerDeltaX, -centerDeltaY);

  context.strokeStyle = 'rgb(255, 0, 0)';
  context.strokeRect(data.crop.left, data.crop.top, data.crop.width, data.crop.height);

  const zip = new JSZip();
  for (let i = 0; i < imgs.length; i++) {
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      zip.file(`${imgs[i].filename}.png`, blob);
      if (i === imgs.length - 1)
        zip
          .generateAsync({
            type: 'blob',
          })
          .then(function (content) {
            saveAs(content, 'context.zip');
          });
    });
  }
};

if (elems.imagesInput && elems.croppingDiv && elems.downloadCroppedButton && elems.downloadContextButton) {
  elems.imagesInput.value = '';

  elems.cropWidthInput.addEventListener('change', updateCropSize);
  elems.cropHeightInput.addEventListener('change', updateCropSize);
  elems.imagesInput.addEventListener('change', updateImagesToDisplay(elems.croppingDiv, elems.imagesInput));
  elems.downloadCroppedButton.addEventListener('click', downloadCropped);
  elems.downloadContextButton.addEventListener('click', downloadContext);
}
