import { Loader } from "@googlemaps/js-api-loader";

const additionalOptions = {};
const mapOptions = {
  center: { lat: -34.397, lng: 150.644 },
  zoom: 8,
};

const loader = new Loader({
  apiKey: "AIzaSyCVrsMKR6f35_JQGglt5bCJaI_wpQkLWWU",
  version: "weekly",
  ...additionalOptions,
});

loader.load().then(async () => {
  const { Map } = await loader.importLibrary("maps");

  new Map(document.getElementById("map"), mapOptions);
}).catch((e) => {
  console.error("Error loading Google Maps:", e);
});
