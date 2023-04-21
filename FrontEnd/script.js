/* Récupération des éléments du DOM qui accueilleront les images */
const gallery = document.querySelector("#gallery")
const modalGallery = document.querySelector("#modal-gallery")

function addPicturesToTarget(target, pictureArray, destroyButton = false, changeFigcaptionText = false, nouveauTexte = "éditer") {
  pictureArray.forEach(obj => {

/* Création des balises pour les éléments de la gallerie car elle est gérée dynamiquement */
    const figure = document.createElement("figure")
    // <figure></figure>
    figure.dataset.categoryId = obj.categoryId
    // <figure data-category-id="4"></figure>
    const image = document.createElement("img")
    // <img></img>
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
      // code pour créer le bouton de suppression dans la modale
      const deleteBtn = document.createElement("button")
      deleteBtn.setAttribute("type", "button")
      deleteBtn.dataset.id = obj.id
      deleteBtn.classList.add('deleteBtn')
      const icon = document.createElement("i")
      icon.classList.add("fa-regular", "fa-trash-can")

      deleteBtn.onclick = (event) => { deletePicture(event) }

      deleteBtn.appendChild(icon)
      figure.appendChild(deleteBtn)

      // code pour créer le bouton de déplacement dans la modale
      const moveImgBtn = document.createElement("button")
      moveImgBtn.setAttribute("type", "button")
      moveImgBtn.classList.add('move-img-btn')
      const iconMoveImg = document.createElement("i")
      iconMoveImg.classList.add("fa-solid", "fa-up-down-left-right")

      moveImgBtn.appendChild(iconMoveImg)
      figure.appendChild(moveImgBtn)
    }

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
    console.log(data)
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
  console.log(userAuthenticated)
    if (userAuthenticated) {
      // Si connecter faire des changements sur la page d'accueil
      const logInElement = document.querySelectorAll(".login")
      for (var i= 0; i < logInElement.length; i++) {
        logInElement[i].style.display = "flex"; //peut-on mettre flex au lieu de block ?
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
const modal = document.getElementById("modals")
const modalRemove = document.getElementById("modal-remove")
const openBtn1 = document.querySelectorAll(".open-modal")
const modalAdd = document.getElementById("modal-add")
const openBtn2 = document.querySelectorAll(".btn-add-pics")
const modalContent = document.querySelector(".modal-content");

openBtn1.forEach(btn => {
  btn.addEventListener("click", openModalRemove)
})

function openModalRemove() {
  modal.style.display = "block";
  modalRemove.style.display = "";
  modalAdd.style.display = "none";
}

openBtn2.forEach(btn => {
  btn.addEventListener("click", openModalAdd)
}) //Pourquoi un for each alors qu'il n'y a q'un élt ?

function openModalAdd() {
  modalAdd.style.display = ""; //bonne pratique de ne rien mettre "" ??
  modalRemove.style.display = "none";
}

const closeBtn = document.getElementById("close-btn")
closeBtn.addEventListener("click", closeModal) //pourquoi avec un forEach ça bug ??

function closeModal() {
  modal.style.display= "";
}

modal.addEventListener("click", function(event) {
  if (event.target === modal) {
    closeModal();
  } else if (!modalContent.contains(event.target)) {
    closeModal();
  }
});

/* Création de la fonction de suppression dans la modale*/
function deletePicture(event) {
  const id = event.target.dataset.id;
  fetch(`http://localhost:5678/api/works/${id}`, {
    method: 'DELETE',
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${sessionStorage.token}`
    }
  })
    .then(response => {
      if (response.ok) {
        // suppression de l'image
        const figure = event.target.closest('figure');
        figure.parentNode.removeChild(figure);
      }
    })
    .catch(error => console.error(error));
  }

  //event.stopPropagation() pour éviter la fermture de la modale a chaque suppression
