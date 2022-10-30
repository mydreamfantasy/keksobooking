import { activateForm, activateFilter } from './user-form.js';
import { renderPopup } from './popup.js';
import { getData } from './api.js';
import { showAlert } from './util.js';

const START_LAT = 35.68249;
const START_LNG = 139.75271;
const ZOOM = 12;
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SIMILAR_ADS_COUNT = 10;


const mapCanvas = document.querySelector('#map-canvas');
const addressField = document.querySelector('#address');
const mapFieldsets = document.querySelector('.map__filters').querySelectorAll('fieldset, select');

const icon = L.icon({
  iconUrl: './img/pin.svg',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const mainPinIcon = L.icon({
  iconUrl: './img/main-pin.svg',
  iconSize: [52, 52],
  iconAnchor: [26, 52],
});

const map = L.map(mapCanvas).setView({lat: START_LAT, lng: START_LNG,}, ZOOM);

L.tileLayer(
  TILE,
  {
    attribution: ATTRIBUTION,
  },
).addTo(map);

const mainPinMarker = L.marker(
  {
    lat: START_LAT,
    lng: START_LNG,
  },
  {
    draggable: true,
    icon: mainPinIcon,
  },
);

const addressValueOnDefault = {
  lat: START_LAT,
  lng: START_LNG,
};

addressField.value = `${START_LAT}, ${START_LNG}`;

const onMarkerMove = (evt) => {
  const addressValue = `${((evt.target.getLatLng()).lat).toFixed(5) }, ${ ((evt.target.getLatLng()).lng).toFixed(5)}`;
  addressField.value = addressValue;
};

const resetMap = () => {
  mainPinMarker.setLatLng({
    lat: START_LAT,
    lng: START_LNG,
  });

  map.setView({
    lat: START_LAT,
    lng: START_LNG,
  }, ZOOM);

  addressField.value = `${addressValueOnDefault.lat}, ${addressValueOnDefault.lng}`;
  map.clearLayers();
};

const createMarker = (item) => {
  const lat = item.location.lat;
  const lng = item.location.lng;
  const marker = L.marker(
    {
      lat,
      lng,
    },
    {
      icon,
    },
  );

  marker
    .addTo(map)
    .bindPopup(renderPopup(item));
};

const housingTypeFilter = document.querySelector('#housing-type');
const defaultValue = 'any';

const checkHousingType = (ad) => {
  if (housingTypeFilter.value === defaultValue) {
    return true;
  }
  return ad.offer.type === housingTypeFilter.value;
};

const filterAds = (ads) => {
  const filteredAds = [];
  for (const ad of ads) {
    if (checkHousingType(ad)) {
      filteredAds.push(ad);
    }
  }
  return filteredAds;
};

const renderMarkers = (offers) => {
  filterAds(offers.slice(0, SIMILAR_ADS_COUNT)).forEach((ad) => {createMarker(ad);});
};

const onDataLoad = (ads) => {
  renderMarkers(ads);
  activateFilter();
};

mapFieldsets.addEventListener('change', () => {

});

const onDataFailed = () => {
  showAlert('О, нет! Что-то сломалось. Попробуйте ещё раз');
};

const makeMap = () => {
  map.whenReady( () => {
    activateForm();
    getData(onDataLoad, onDataFailed);
  });
  mainPinMarker.addTo(map);
  mainPinMarker.on('move', onMarkerMove);
};

export { makeMap, resetMap, renderMarkers };
