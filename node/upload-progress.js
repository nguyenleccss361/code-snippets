// https://jakearchibald.com/2025/fetch-streams-not-for-progress/

const xhr = new XMLHttpRequest();

// Upload progress
xhr.upload.onprogress = (event) => {
  if (event.lengthComputable) {
    console.log(
      `Uploaded ${((event.loaded / event.total) * 100).toFixed(2)}%`,
    );
  }
};

// Download progress
xhr.onprogress = (event) => {
  if (event.lengthComputable) {
    console.log(
      `Downloaded ${((event.loaded / event.total) * 100).toFixed(2)}%`,
    );
  }
};

xhr.open('POST', url);
xhr.send(blobOrWhatever);
