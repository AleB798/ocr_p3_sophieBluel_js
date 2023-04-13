
/* Récupération de l'élément du DOM qui accueillera les images */

const gallery = document.querySelector(".gallery")

function addPicturesToTarget(target, pictureArray, destroyButton = false) {
  pictureArray.forEach(obj => {

  /* Création des balises */
    const figure = document.createElement("figure")
    // <figure></figure>
    figure.dataset.categoryId = obj.categoryId
    // <figure data-category-id="4"></figure>
    const image = document.createElement("img")
    // <img></img>
    image.setAttribute("alt", obj.title)
    // <img alt="nom de l'image"></img>
    image.setAttribute("src", obj.imageUrl)
    // <img alt="nom de l'image" src="/images/"..."></img>
    const figcaption = document.createElement("figcaption")
    figcaption.textContent = obj.title
  
    /* On rattache les balises */
    figure.appendChild(image)
    figure.appendChild(figcaption)

    if (destroyButton) {
      // code pour créer le bouton de suppression dans la modale
      const btn = document.createElement("button")
      btn.setAttribute("type", "button")
      btn.onclick = (event) => { deletePicture(event) }
      btn.dataset.id = obj.id
      const iTag = document.createElement("i")
      iTag.classList.add("fa-solid", "fa-trash")
      btn.appendChild(iTag)
      figure.appendChild(btn)
    }

    target.appendChild(figure)
  })
}

 /* Récupération dynamique des données des travaux via l'API */

fetch('http://localhost:5678/api/works')
  .then(response => response.json())
  .then(data => {
    console.log(data)
    addPicturesToTarget(gallery, data);
    addPicturesToTarget(document.querySelector(".modal-gallery"), data, true);
  }) //On appelle ici la fonctiongallery
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

