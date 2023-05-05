/*---Gestion des galeries--- */
/* Récupération des éléments du DOM */
const gallery = document.querySelector("#gallery")
const modalGallery = document.querySelector("#modal-gallery")

function addPicturesToTarget(target, pictureArray, destroyButton = false, changeFigcaptionText = false, nouveauTexte = "éditer") {
  pictureArray.forEach(obj => {

/* Création des balises pour les éléments de la galerie */
    const figure = document.createElement("figure")
    // <figure></figure>
    figure.dataset.categoryId = obj.categoryId
    // <figure data-category-id="4"></figure>
    const image = document.createElement("img")
    // <img>
      //Pour ajouter les attributs à la balise <img> : Element.setAttribute(name, value);
      image.setAttribute("alt", obj.title) 
      // <img alt="nom de l'image"></img>
      image.setAttribute("src", obj.imageUrl)
      // <img alt="nom de l'image" src="/images/"..."></img>
    const figcaption = document.createElement("figcaption")
    figcaption.textContent = obj.title
  
/* On rattache les balises */
    figure.appendChild(image)
    figure.appendChild(figcaption)
    target.appendChild(figure)

    if (destroyButton) {
      // création du bouton de supression d'image dans la modale
      const deleteBtn = document.createElement("button")
      deleteBtn.setAttribute("type", "button")
      deleteBtn.dataset.id = obj.id
      deleteBtn.classList.add('deleteBtn')
      const icon = document.createElement("i")
      deleteBtn.dataset.id = obj.id
      deleteBtn.classList.add('deleteBtn')
      icon.classList.add("fa-regular", "fa-trash-can")

      deleteBtn.appendChild(icon)
      figure.appendChild(deleteBtn)
      figure.id = `modal-picture-${obj.id}`

      //Ajout d'écouteur d'évènement pour le btn de supression d'image
      deleteBtn.addEventListener('click', deletePicture);


      // création du bouton de déplacement d'image dans la modale
      const moveImgBtn = document.createElement("button")
      moveImgBtn.setAttribute("type", "button")
      moveImgBtn.classList.add('move-img-btn')
      const iconMoveImg = document.createElement("i")
      iconMoveImg.classList.add("fa-solid", "fa-up-down-left-right")

      moveImgBtn.appendChild(iconMoveImg)
      figure.appendChild(moveImgBtn)
    } else {
      figure.id = `picture-${obj.id}`
    }

    //Changement des textes pour les images de la modalGallery
    if (changeFigcaptionText && target === modalGallery) {
      //changer le texte des figcaptions
      const figcaptions = modalGallery.querySelectorAll('figure > figcaption');
      figcaptions.forEach(figcaption => figcaption.textContent = nouveauTexte);
    }
  })
}

/* Récupération dynamique des données des travaux via l'API */
fetch('http://localhost:5678/api/works')
  .then(response => response.json())
  .then(data => {
    addPicturesToTarget(gallery, data);
    addPicturesToTarget(modalGallery, data, true, true);
  }) // on appele la f crée ci-dessus
  .catch(error => console.error(error))
  
/* Création de la fonction de filtres */
 document.querySelectorAll(".filter-button").forEach(btn => {
  btn.addEventListener("click", filterImages)
})

function filterImages (event) {
  const categoryId = event.target.dataset.categoryId
  gallery.querySelectorAll("figure").forEach(figure => {
    if (categoryId === undefined || figure.dataset.categoryId === categoryId) {
      figure.style.display = ""
    } else {
      figure.style.display = "none"
    }
  })
}

/* ---Page version admin--- */
/* Vérifier si l'utilisateur est connecté et faire changement */
const userAuthenticated = sessionStorage.getItem('token');
    if (userAuthenticated) {
      // Si connecter faire des changements sur la page d'accueil
      const logInElement = document.querySelectorAll(".login")
      for (var i= 0; i < logInElement.length; i++) {
        logInElement[i].style.display = "flex";
      }

      //supprimer les filtres en mode admin
      document.querySelector('.filters-gallery').style.display = "none";

      //changer le texte du lien de navigation
      var loginLink = document.getElementById("log-link");
      loginLink.textContent = "Logout";
    }

/* Création de la fonction logout */
const logoutLink = document.getElementById("log-link");
logoutLink.addEventListener("click", logout);

function logout() {
  sessionStorage.removeItem('token');
  location.reload();
}

/*--- MODALS ---*/
/* fonctions open & close */
const modal = document.getElementById("modals")
const modalRemove = document.getElementById("modal-remove")
const openBtn1 = document.querySelector(".open-modal")
const modalAdd = document.getElementById("modal-add")
const openBtn2 = document.querySelector(".btn-add-pics")
const modalContent = document.querySelector(".modal-content");
const arrowBack = document.getElementById("arrowBack")

openBtn1.addEventListener("click", openModalRemove)

function openModalRemove() {
  modal.style.display = "block";
  modalRemove.style.display = "";
  modalAdd.style.display = "none";
  arrowBack.style.display = "";
}

openBtn2.addEventListener("click", openModalAdd)

function openModalAdd() {
  modalAdd.style.display = "";
  modalRemove.style.display = "none";
  arrowBack.style.display = "block";
}

arrowBack.addEventListener("click", goBack)

function goBack() {
  modalAdd.style.display = "none";
  modalRemove.style.display = "";
  arrowBack.style.display = "";
  imgPreview.innerHTML = ''; //supprime la preview
  boxAddPic.style.display = '';
}

const closeBtn = document.getElementById("close-btn")
closeBtn.addEventListener("click", closeModal)

function closeModal() {
  modal.style.display= "";
}

modal.addEventListener("click", function(event) {
  if (event.target === modal) {
    closeModal();
  } 
});

/* Création de la fonction de suppression d'image */
function deletePicture(event) {
  const id = event.target.dataset.id;
  
  fetch(`http://localhost:5678/api/works/${id}`, {
    method: 'DELETE',
    headers: {
      'accept' : "*/*",
      'authorization': `Bearer ${sessionStorage.token}`
    }
  })
    .then(function(response) {
      if (response.ok) {
        // suppression de l'image
        const figure = event.target.closest('figure');
        figure.remove();
        const figureHome = document.getElementById(`picture-${id}`)
        figureHome.remove();
      } else {
        alert('Erreur');
      }
    })
    .catch(error => console.error(error));
}

/* Création de la fonction d'ajout d'image */
const addPicFormEls = document.getElementById('add-pics-form');
const userImg = document.getElementById('user-files');
const imgPreview = document.getElementById('img-preview');
const boxAddPic = document.getElementById('box-add-pics')

userImg.addEventListener('change', () => {
  const file = userImg.files[0];
  const allowedTypes = ['image/jpeg', 'image/png']; // types de fichiers autorisés
  const maxSize = 4 * 1024 * 1024; // taille max de l'image en octets ce qui vaut 4Mo

  if (allowedTypes.includes(file.type) && file.size <= maxSize) { // conditions à remplir pour que l'image se preview
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.addEventListener('load', () => {
      const url = fileReader.result;
      const newImg = new Image();
      newImg.src = url;

      imgPreview.appendChild(newImg);

      boxAddPic.style.display = 'none';
      imgPreview.style.display = 'block';
    });
  } else {
    alert('Veuillez sélectionner une image au format JPEG ou PNG, et dont la taille ne dépasse pas 4 Mo.');
    userImg.value = ''; // efface la sélection de l'utilisateur
  }
});

addPicFormEls.addEventListener('submit', (e) => {
  e.preventDefault();

  const imgTitle = document.getElementById('title').value;
  const imgCategory = document.getElementById('category').value;

  const formData = new FormData();
  formData.append('image', userImg.files[0]);
  formData.append('title', imgTitle);
  formData.append('category', imgCategory);

  // Vérifier si les champs sont vides, si c'est le cas message d'alerte
  if (!imgTitle || !imgCategory || !userImg.files[0]) {
    alert('Veuillez vérifier que tous les champs soient bien remplis.');
    return;
  }

  fetch('http://localhost:5678/api/works', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionStorage.token}`
    },
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      boxAddPic.style.display = '';
      addPicFormEls.reset();

      alert('Votre formulaire a bien été envoyé.');

      imgPreview.innerHTML = ''; //supprime la preview

      addPicturesToTarget(gallery, [data]);
      addPicturesToTarget(modalGallery, [data], true, true);
    })
    .catch(error => console.error(error));  
});


