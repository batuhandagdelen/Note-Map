//! İMPORTS
import { ui, personIcon } from "./ui.js";
import { getNoteIcon, formatDate, getStatus } from "./helpers.js";
//!GLOBAL VARİABLES

const STATE = {
  map: null,
  layer: null,
  clickedCoords: null,
  notes: JSON.parse(localStorage.getItem("notes") || "[]"),
};

console.log(STATE.notes);

//!KULLANICI KONUMUNA GÖRE HARİTAYI YÜKLEME
window.navigator.geolocation.getCurrentPosition(
  //kullanıcı izin verirse olduğu konumu yükle

  (e) => loadMap([e.coords.latitude, e.coords.longitude]),

  //kullanıcı izin vermezse adana konumunu yükle

  () => loadMap([37.00167, 35.32889])
);

//!LEAFLET HARITASININ KURULUMUNU YAPAN FONKSİYON
function loadMap(position) {
  //haritanın kurulumu
  STATE.map = L.map("map", { zoomControl: false }).setView(position, 13);

  //haritayı arayüze ekleme

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(STATE.map);

  // ekrana marker renderla

  const marker = L.marker(position, { icon: personIcon }).addTo(STATE.map);

  // marker a popup ekle

  marker.bindPopup("<b>Buradasınız...</b>");

  // zoom elemanını sağ alta taşı

  L.control.zoom({ position: "bottomright" }).addTo(STATE.map);

  // harita üzerinde bir layer oluştur

  STATE.layer = L.layerGroup().addTo(STATE.map);

  // haritaya tıklanma olayını izle

  STATE.map.on("click", onMapClick);

  //notları ekrana renderala

  renderNoteCards(STATE.notes);

  //markerları ekrana renderla

  renderMarker(STATE.notes);
}

//!HARİTAYA TIKLANINCA ÇALIŞACAK FONKSİYON

function onMapClick(e) {
  //son tıklanan konumu kaydet
  STATE.clickedCoords = [e.latlng.lat, e.latlng.lng];

  // aside alanındaki formu aktif et

  ui.aside.classList.add("add");

  // aside title ı güncelle

  ui.asideTitle.textContent = "Yeni Not";
}

//!İPTAL BUTONUNA TIKLANINCA

ui.cancelButton.addEventListener("click", () => {
  // aside alanını ekleme modundan çıkar

  ui.aside.classList.remove("add");

  //Başlığı eski haline çevir

  ui.asideTitle.textContent = "Notlar";
});

//!OK A TIKLANINCA ASİDE ALANINI AÇ/KAPA

ui.arrow.addEventListener("click", () => {
  ui.aside.classList.toggle("hide");
});

//!FORM GÖNDERİLİNCE

ui.form.addEventListener("submit", (e) => {
  //sayfa yenilenmesini durdur

  e.preventDefault();

  //formdaki verilere eriş
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  //eğer form doldurulmadıysa uyarı ver

  if (!title || !date || !status) {
    return alert(`Lütfen Formu Doldurunuz`);
  }

  //kaydedilecek nesneyi oluştur
  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: STATE.clickedCoords,
  };

  //notes dizisine yeni notu ekle

  STATE.notes.push(newNote);

  //localstorage ı güncelle

  localStorage.setItem("notes", JSON.stringify(STATE.notes));

  //ekleme modunu kapat ve başlığı notlar olarak güncelle
  ui.aside.classList.remove("add");

  ui.asideTitle.textContent = "Notlar";

  //notları ekrana renderala

  renderNoteCards(STATE.notes);

  //markerları ekrana renderla

  renderMarker(STATE.notes);
});

//!NOTE MARKER LARINI RENDERLAYACAK FONKSİYON

function renderMarker(notes) {
  // daha önceden eklenen markerları temizle

  STATE.layer.clearLayers();

  //STATE.notes dizisi içerisindeki her bir not için marker renderla

  notes.forEach((note) => {
    // note un status değerine göre markerı belirle

    const icon = getNoteIcon(note.status);

    // marker oluştur
    const marker = L.marker(note.coords, { icon }).addTo(STATE.layer);

    // notların başlığını popup olarak marker a ekle

    marker.bindPopup(`<p class="popup">${note.title}<p>`);
  });
}

//!NOTE ELAMANLARINI RENDERLAYACAK FONKSİYON

function renderNoteCards(notes) {
  //dizideki herbir elemanı dön ve herbiri için bu html yi oluştur
  const notesHtml = notes
    .map(
      (note) => `   <li>
          <div>
            <h3>${note.title}</h3>
            <p>${formatDate(note.date)}</p>
            <p class="status">${getStatus(note.status)}</p>
          </div>
          <div class="icons">
            <i data-id=${note.id} id="fly-btn" class="bi bi-airplane-fill"></i>
            <i data-id=${note.id} id="trash-btn" class="bi bi-trash"></i>
          </div>
        </li>`
    )
    .join("");

  //oluşan htmlleri notelist in içine aktar

  ui.noteList.innerHTML = notesHtml;

  //*delete butona tıklanma olayını izle

  document.querySelectorAll("#trash-btn").forEach((btn) => {
    //tıklanılan butonun id sine eriş

    const id = +btn.dataset.id;

    btn.addEventListener("click", () => deleteNote(id));
  });

  document.querySelectorAll("#fly-btn").forEach((btn) => {
    //tıklanılan butonun id sine eriş

    const id = +btn.dataset.id;

    btn.addEventListener("click", () => flyToNote(id));
  });
}

//!SİLME OLAYINI YAPACAK FONKSİYON

const deleteNote = (id) => {
  //kullanıcıdan onay iste

  if (!confirm("Notu silmek istediğinizden emin misiniz?")) return;

  //id si bilinen notu diziden kaldırmak için filtrele

  STATE.notes = STATE.notes.filter((note) => note.id !== id);

  //localStorage ı güncelle

  localStorage.setItem("notes", JSON.stringify(STATE.notes));

  //arayüzü güncelle

  renderMarker(STATE.notes);
  renderNoteCards(STATE.notes);
};

//!NOTU HARİTADA ZOOMLAYACAK FONKSİYON

const flyToNote = (id) => {
  // id si bilinen elemanı bul
  const note = STATE.notes.find((note) => note.id === id);

  //bulunan koordinatları haritada göster
  STATE.map.flyTo(note.coords, 14);
};
