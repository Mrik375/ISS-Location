let map;
let issMarker;
let icon = L.icon({
    iconUrl: './img/iss.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
});

let followISS = true; // Variable pour activer ou désactiver le suivi automatique
let initialZoom; // Variable pour stocker le niveau de zoom initial

async function afficherPosition() { // [async - await] => permet d'attendre le retour de fetch(promesse résolue) pour pouvoir passer à la suite.
    const result = await fetch('http://api.open-notify.org/iss-now.json');
    const data = await result.json();
    let latitude, longitude;
    if(data) {
        latitude = data.iss_position.latitude;
        longitude = data.iss_position.longitude;
        document.getElementById('latitude').innerText = latitude;
        document.getElementById('longitude').innerText = longitude;
    }
    // Si le marqueur existe déjà, mettre à jour sa position, sinon en créer un
    if(issMarker) {
        issMarker.setLatLng([latitude, longitude]); // Met à jour la position du marqueur
    }else {
        issMarker = L.marker([latitude, longitude], {icon: icon}).addTo(map).bindPopup('ISS Current Location');
    }
    // Recentre la carte uniquement si le suivi est activé
    if(followISS) {
        map.setView([latitude, longitude], map.getZoom());
    }
}

function init() {
    map = L.map('map').setView([51.505, -0.09], 4); // précise la position de la carte à son initialisation.    
    initialZoom = map.getZoom(); // Stocker le niveau de zoom initial
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    // Désactive le suivi automatique lorsque l'utilisateur déplace la carte
    map.on('dragstart', () => {
        followISS = false;
    });
    // Ajoute un bouton pour recentrer la carte sur l'ISS
    const recenterButton = L.control({ position: 'topleft' });

    recenterButton.onAdd = function () {
        let div = L.DomUtil.create('div', 'recenter-button');
        div.style.backgroundColor = 'white';
        div.style.backgroundImage = "url('./img/recentrer.png')"; // Icône pour le bouton
        div.style.backgroundSize = '40px 40px';
        div.style.width = '40px';
        div.style.height = '40px';
        div.style.borderRadius = '20px';
        div.style.cursor = 'pointer';

        div.onclick = function () {
            followISS = true; // Réactive le suivi de l'ISS
            map.setView(map.getCenter(), initialZoom); // Revenir au niveau de zoom initial
            afficherPosition(); // Recentre immédiatement sur l'ISS
        };
        return div;
    };
    recenterButton.addTo(map);

    afficherPosition();
    setInterval(afficherPosition, 1000);
}
init();