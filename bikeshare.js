// Realtime status
const STATUS_URL = 'https://gbfs.baywheels.com/gbfs/en/station_status.json';
// Has names, etc.
// const INFORMATION_URL = 'https://gbfs.baywheels.com/gbfs/en/station_information.json';
// info.map(st => console.log(st.name, st.station_id));
// const info = await fetchJsonData(INFORMATION_URL);

const MIDDAY = 12;

// Cut offs for collapsing next station in list
const MIN_BIKES = 2;
const MIN_DOCKS = 2;

const bartStations = [
  { id: 5, name: 'Powell St BART Station' },
  { id: 4, name: 'Cyril Magnin St at Ellis St' },
  { id: 446, name: 'Mint St at Mission St' },
];

const workStations = [
  { id: 453, name: 'Brannan St at 4th St' },
  { id: 80, name: 'Townsend St at 5th St' },
  { id: 30, name: 'San Francisco Caltrain' },
];

async function fetchJsonData(url) {
  const response = await fetch(url);
  const result = await response.json();
  return result.data.stations;
}

function getStationsFromDirection(direction) {
  const bikeStations = direction === 'inbound' ? bartStations : workStations;
  const dockStations = direction === 'outbound' ? bartStations : workStations;
  return [bikeStations, dockStations];
}

(async () => {
  const stationsStatus = await fetchJsonData(STATUS_URL);

  const direction = new Date().getHours() < MIDDAY ? 'inbound' : 'outbound';
  const [bikeStations, dockStations] = getStationsFromDirection(direction);

  function renderStations(stations, type) {
    const richStations = stations.map((myStation) => {
      const status = stationsStatus.find((status) => Number(status.station_id) === myStation.id);
      return {
        id: myStation.id,
        name: myStation.name,
        num_bikes_available: status.num_bikes_available,
        num_docks_available: status.num_docks_available,
      };
    });

    let show = true;

    richStations.forEach((station) => {
      const docks = station.num_docks_available;
      const bikes = station.num_bikes_available;

      document.getElementById('stations').insertAdjacentHTML(
        'beforeEnd',
        `
        <div class="station">
          <input id="station${station.id}" class="toggle" type="checkbox" ${show ? 'checked' : ''}>
          <label for="station${station.id}" class="lbl-toggle">
            <h1 class="name">${station.name}</h1>
          </label>
          <div class="collapsible-content">
            <div class="bikes"><span class="number ${bikes <= 3 ? 'low' : 'high'}">${bikes}</span>bikes</div>
            <div class="docks"><span class="number ${docks <= 3 ? 'low' : 'high'}">${docks}</span>docks</div>
          <div class="collapsible-content">
        </div>
        `,
      );
      // Determine if the next station should start collapsed or not

      // always show first
      // hide next if you met the criteria
      // hide if prev was hidden

      show = show && type === 'bike' ? bikes < MIN_BIKES : docks < MIN_DOCKS;
    });
  }

  renderStations(bikeStations, 'bike');
  renderStations(dockStations, 'dock');
})();
