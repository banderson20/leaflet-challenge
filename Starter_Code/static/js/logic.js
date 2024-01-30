let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function(data) {
  createFeatures(data);
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>This earthquake is ${feature.geometry.coordinates[2]}km deep and is a magnitude ${feature.properties.mag}.</p>`);
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      let magnitude = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
      return new L.circle(latlng, {
        fillOpacity: 0.75,
        color: "black",
        fillColor: markerColor(depth, earthquakeData),
        radius: markerSize(magnitude)
      });
    }
  });

  createMap(earthquakes);
};

function createMap(earthquakes) {
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let baseMaps = {
    "Street Map": street,
  };

  let overlayMaps = {
    Earthquakes: earthquakes,
  };

  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  let info = L.control({
    position: "bottomright"
  });


  info.onAdd = function() {
    let div = L.DomUtil.create("div", "legend");
    return div;
  };

  info.addTo(myMap);
  updateLegend(info);
};

function markerSize(mag) {
  let magnitude = Math.abs(parseFloat(mag));
  return magnitude * 30000;
};

function markerColor(depth, earthquakeData) {
  let colorScale = chroma.scale(['#a2f838', '#daf639', '#f5dc39', '#fbb83e', '#faa364', '#fd5d67']).domain([-10, 10, 30, 50, 70, 90]);
  return colorScale(depth).hex();
};

function updateLegend(info) {
  document.querySelector(".legend").innerHTML = "";

  let depthBreaks = [-10, 10, 30, 50, 70, 90];

  for (let i = 0; i < depthBreaks.length; i++) {
    let color = markerColor(depthBreaks[i]);

    document.querySelector(".legend").innerHTML +=
      `<div class="legend-item">
         <div class="legend-color-box" style="background-color:${color};"></div>
         <p>${depthBreaks[i]}${(depthBreaks[i + 1] ? '&ndash;' + depthBreaks[i + 1] : '+')}</p>
       </div>`;
  }
};
