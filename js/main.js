window.onload = function() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const window_height = canvas.offsetHeight;
    const window_width = canvas.offsetWidth;

    canvas.height = window_height;
    canvas.width = window_width;

    let score = 0;
    let highScore = 0;
    let level = 1;
    let creationInterval = 800; // Intervalo de creación de imágenes en milisegundos
    let imagesEliminated = 0; // Contador de imágenes eliminadas
    const maxEliminatedImages = 10; // Máximo número de imágenes eliminadas antes de Game Over

    const restartButton = document.getElementById("restartButton");

    class ImageObject {
        constructor(x, y, imgSrc, width, height, speedX, speedY) {
            this.posX = x;
            this.posY = y;
            this.width = width;
            this.height = height;
            this.image = new Image();
            this.image.src = imgSrc;
            this.speedX = speedX;
            this.speedY = speedY;
        }

        draw(context) {
            context.drawImage(this.image, this.posX, this.posY, this.width, this.height);
        }

        update(context) {
            this.draw(context);
            this.posX -= this.speedX;
            this.posY += this.speedY;

            // Eliminar la imagen si toca el límite inferior del canvas
            if (this.posY + this.height > window_height) {
                const index = imageObjects.indexOf(this);
                if (index > -1) {
                    imageObjects.splice(index, 1);
                    imagesEliminated++;
                }
            }

            // Rebotar en los bordes del canvas (excepto el borde inferior)
            if (this.posX + this.width > window_width || this.posX < 0) {
                this.speedX = -this.speedX;
            }
            if (this.posY < 0) {
                this.speedY = -this.speedY;
            }
        }

        checkCollision(other) {
            return this.posX < other.posX + other.width &&
                   this.posX + this.width > other.posX &&
                   this.posY < other.posY + other.height &&
                   this.posY + this.height > other.posY;
        }

        handleCollision(other) {
            const tempSpeedX = this.speedX;
            const tempSpeedY = this.speedY;
            this.speedX = other.speedX;
            this.speedY = other.speedY;
            other.speedX = tempSpeedX;
            other.speedY = tempSpeedY;
        }

        isClicked(mouseX, mouseY) {
            return mouseX >= this.posX && mouseX <= this.posX + this.width &&
                   mouseY >= this.posY && mouseY <= this.posY + this.height;
        }
    }

    const imageObjects = [];
    const maxImages = 10;  // Límite de creación de imágenes

    function createImageObject() {
        if (imageObjects.length >= maxImages) {
            return;  // Detener la creación de nuevas imágenes si se alcanza el límite
        }

        const imgSrc = 'assets/img/Cangrejo2.png'; // Reemplaza con la ruta a tu imagen
        const imgWidth = 100; // Ancho personalizado de la imagen
        const imgHeight = 100; // Alto personalizado de la imagen
        const x = Math.random() * (window_width - imgWidth); // Ajusta la posición en x
        const y = Math.random() * (window_height - imgHeight); // Ajusta la posición en y

        // Generar velocidades aleatorias en x y y
        const speedX = (Math.random() - 0.15) * 4;
        const speedY = (Math.random() - 0.15) * 4;

        imageObjects.push(new ImageObject(x, y, imgSrc, imgWidth, imgHeight, speedX, speedY));
    }

    function updateImageObjects() {
        if (imagesEliminated >= maxEliminatedImages) {
            showGameOver();
            return; // Detener la actualización de las imágenes
        }

        requestAnimationFrame(updateImageObjects);
        ctx.clearRect(0, 0, window_width, window_height);
        imageObjects.forEach(imageObject => imageObject.update(ctx));

        // Verificar colisiones
        for (let i = 0; i < imageObjects.length; i++) {
            for (let j = i + 1; j < imageObjects.length; j++) {
                if (imageObjects[i].checkCollision(imageObjects[j])) {
                    imageObjects[i].handleCollision(imageObjects[j]);
                }
            }
        }

        // Dibujar la puntuación, el nivel y la puntuación más alta en el canvas
        ctx.fillStyle = 'rgb(233,7,56)';
        ctx.font = '20px Arial';
        ctx.fillText('Puntuación: ' + score, 10, 30);
        ctx.fillText('Nivel: ' + level, window_width - 100, 30);
        ctx.fillText('Puntuación más alta: ' + highScore, 10, window_height - 10);
    }

    function handleMouseClick(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Verificar si se hizo clic en alguna imagen y eliminarla
        for (let i = 0; i < imageObjects.length; i++) {
            if (imageObjects[i].isClicked(mouseX, mouseY)) {
                imageObjects.splice(i, 1);

                // Incrementar la puntuación
                score++;

                // Actualizar la puntuación más alta si es necesario
                if (score > highScore) {
                    highScore = score;
                }

                // Incrementar el nivel y reducir el intervalo de creación de imágenes
                if (score % 8 === 0) {
                    level++;
                    creationInterval /= 2; // Duplicar la velocidad de aparición de imágenes

                    // Reiniciar el intervalo de creación de imágenes
                    clearInterval(imageCreationInterval);
                    imageCreationInterval = setInterval(createImageObject, creationInterval);
                }

                break; // Salir del bucle una vez que se elimine la imagen
            }
        }
    }

    function showGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, window_width, window_height);

        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', window_width / 2, window_height / 2);

        restartButton.style.display = 'block'; // Mostrar el botón de reinicio
    }

    function restartGame() {
        score = 0;
        level = 1;
        creationInterval = 1000;
        imagesEliminated = 0;
        imageObjects.length = 0; // Eliminar todas las imágenes
        restartButton.style.display = 'none'; // Ocultar el botón de reinicio
        imageCreationInterval = setInterval(createImageObject, creationInterval);
        updateImageObjects(); // Reiniciar la actualización de imágenes
    }

    canvas.addEventListener('click', handleMouseClick);
    restartButton.addEventListener('click', restartGame);

    let imageCreationInterval = setInterval(createImageObject, creationInterval);
    updateImageObjects(); // Llama a la función para actualizar las imágenes
};
