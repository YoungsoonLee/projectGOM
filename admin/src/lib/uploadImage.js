export default(function () {
    return {
        uploadImageCallBack: (file) => {
            return new Promise(
                (resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', 'https://api.imgur.com/3/image');
                    xhr.setRequestHeader('Authorization', 'Client-ID bd1d70b890b984d');
                    const data = new FormData();
                    data.append('image', file);
                    xhr.send(data);
                    xhr.addEventListener('load', () => {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    });
                    xhr.addEventListener('error', () => {
                        const error = JSON.parse(xhr.responseText);
                        reject(error);
                    });
                }
            );
        }
    }
})();
