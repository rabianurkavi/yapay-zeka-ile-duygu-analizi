const video =document.getElementById("video")


//Javascript'te birden fazla asenkron işlemi aynı anda işleme almak için Promise.all(array[]) statik metodunu kullanılır. 
//Böylelikle diğer asenkron işlemlerin bitmesini beklemeden diğerlerini de işleme almış oluyoruz.
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]).then(startCamera)


//kamerayı aç
function startCamera(){

    navigator.getUserMedia({
        video:{}
    },
    stream => (video.srcObject = stream), 
    err => console.log(err));
    //kameradan gelen veri streame aktarılacak streami de video.srcObject kısmına aktarıyoruz.   
};

video.addEventListener("play", () => {

    //görüntüyü videodan al
    const canvas = faceapi.createCanvasFromMedia(video);

    const boxSize = {
        width: video.width,
        height: video.height
    };
//canvasımda oluşan görüntüyle benim boxSizem'ı eşleştir boyutları eşleştir (kare yüzüne oturması için)
    faceapi.matchDimensions(canvas,boxSize)



    document.body.append(canvas); // kendi dokumanına bu canvas objesini ekle
    setInterval( async() => {
        //asenkron işlemler
        //Bir görüntüdeki tüm yüzleri algıla => detectAllFaces
       const detections= await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
       .withFaceLandmarks()
       .withFaceExpressions();// üzgün kızgın olduğunu bilmesi

       canvas.getContext("2d").clearRect(0, 0, canvas.width,canvas.height);

       //yeniden boyutlandıracak şeyler faceapiden resizeResults fonksiyonuyla beraber bütün tespitleri alacak ve bunu bir formatta yazdıracak
       //bir ölçüyle boxSize ile kutuyu belirleyeceğiz
       const resizedDetections= faceapi.resizeResults(detections,boxSize);

       faceapi.draw.drawDetections(canvas,resizedDetections)

       faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
       faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

       //console.log(detections);
    },100)
})