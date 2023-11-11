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

type State = Array<{ cropper: Cropper; filename: string; imgElement: HTMLImageElement }>;

let state: State = [];

const updateImagesToDisplay = (preview: HTMLElement, images: HTMLInputElement) => () => {
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild);
  }
  state = [];
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
      center: false,
      cropBoxResizable: false,
      data: {
        width: parseInt(elems.cropWidthInput.value),
        height: parseInt(elems.cropHeightInput.value),
      },
      dragMode: 'none',
      guides: false,
      minContainerWidth: preview.offsetWidth,
      minContainerHeight: preview.offsetWidth,
      responsive: false,
      zoomable: false,
    });
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '180';
    slider.value = '0';
    slider.addEventListener('input', () => cropper.setData({ rotate: parseInt(slider.value) }));

    state.push({ cropper, filename: file.name, imgElement: img });
    listItem.appendChild(img);
    listItem.appendChild(slider);
    list.appendChild(listItem);
  }
};

const updateCropSize = () => {
  for (const cropper of state) {
    cropper.cropper.setData({
      width: parseInt(elems.cropWidthInput.value),
      height: parseInt(elems.cropHeightInput.value),
    });
  }
};

const downloadCropped = () => {
  const zip = new JSZip();
  for (let i = 0; i < state.length; i++) {
    state[i].cropper.getCroppedCanvas().toBlob((blob) => {
      if (!blob) {
        return;
      }
      zip.file(`${state[i].filename}.png`, blob);
      if (i === state.length - 1)
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
  const zip = new JSZip();
  for (let i = 0; i < state.length; i++) {
    const img = state[i].imgElement;

    const data = {
      container: state[i].cropper.getContainerData(),
      canvas: state[i].cropper.getCanvasData(),
      image: state[i].cropper.getImageData(),
      crop: state[i].cropper.getCropBoxData(),
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
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      zip.file(`${state[i].filename}.png`, blob);
      if (i === state.length - 1)
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
