// pages/index.tsx
import { GetServerSideProps } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { fetchWeatherApi } from "openmeteo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Definice typu dat, které obdržíme
interface WeatherData {
  hourly: {
    time: string[];
    temperature2m: number[];
    relativeHumidity2m: number[];
    apparentTemperature: number[];
    precipitationProbability: number[];
    precipitation: number[];
    rain: number[];
    showers: number[];
    snowfall: number[];
    snowDepth: number[];
    weatherCode: number[];
    pressureMsl: number[];
    surfacePressure: number[];
    cloudCover: number[];
    cloudCoverLow: number[];
    cloudCoverMid: number[];
    cloudCoverHigh: number[];
    visibility: number[];
    evapotranspiration: number[];
    et0FaoEvapotranspiration: number[];
    vapourPressureDeficit: number[];
  };
}

export const getServerSideProps: GetServerSideProps = async () => {
  const params = {
    latitude: 50.7345,
    longitude: 15.3609,
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "snow_depth",
      "weather_code",
      "pressure_msl",
      "surface_pressure",
      "cloud_cover",
      "cloud_cover_low",
      "cloud_cover_mid",
      "cloud_cover_high",
      "visibility",
      "evapotranspiration",
      "et0_fao_evapotranspiration",
      "vapour_pressure_deficit",
    ],
    forecast_days: 1,
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const hourly = response.hourly()!;

  // Pomocná funkce pro generování časové řady
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  const times = range(
    Number(hourly.time()),
    Number(hourly.timeEnd()),
    hourly.interval()
  ).map((t) => new Date((t + utcOffsetSeconds) * 1000).toISOString());

  const weatherData: WeatherData = {
    hourly: {
      time: times,
      temperature2m: [...hourly.variables(0)!.valuesArray()!],
      relativeHumidity2m: [...hourly.variables(1)!.valuesArray()!],
      apparentTemperature: [...hourly.variables(2)!.valuesArray()!],
      precipitationProbability: [...hourly.variables(3)!.valuesArray()!],
      precipitation: [...hourly.variables(4)!.valuesArray()!],
      rain: [...hourly.variables(5)!.valuesArray()!],
      showers: [...hourly.variables(6)!.valuesArray()!],
      snowfall: [...hourly.variables(7)!.valuesArray()!],
      snowDepth: [...hourly.variables(8)!.valuesArray()!],
      weatherCode: [...hourly.variables(9)!.valuesArray()!],
      pressureMsl: [...hourly.variables(10)!.valuesArray()!],
      surfacePressure: [...hourly.variables(11)!.valuesArray()!],
      cloudCover: [...hourly.variables(12)!.valuesArray()!],
      cloudCoverLow: [...hourly.variables(13)!.valuesArray()!],
      cloudCoverMid: [...hourly.variables(14)!.valuesArray()!],
      cloudCoverHigh: [...hourly.variables(15)!.valuesArray()!],
      visibility: [...hourly.variables(16)!.valuesArray()!],
      evapotranspiration: [...hourly.variables(17)!.valuesArray()!],
      et0FaoEvapotranspiration: [...hourly.variables(18)!.valuesArray()!],
      vapourPressureDeficit: [...hourly.variables(19)!.valuesArray()!],
    },
  };

  return {
    props: {
      weatherData,
    },
  };
};

type HomeProps = {
  weatherData: WeatherData;
};

export default function Home({ weatherData }: HomeProps) {
  const data = weatherData;
  const utcDateTimes = weatherData.hourly.time.map((dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString();
  });

  const dateTime = utcDateTimes[utcDateTimes.length - 1];

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)]`}
    >
      <main>
        <h1>Počasí z Open-Meteo</h1>
        <div>
          {data.hourly.apparentTemperature.map(
            (value: number, index: number) => (
              <ul>
                <li className="flex flex-col">
                  {utcDateTimes.map((utcDateTime) => (
                    <div>{utcDateTime}</div>
                  ))}
                </li>
                <li key={index}>{value.toFixed(1)} C</li>
              </ul>
            )
          )}
        </div>
      </main>
      <footer></footer>
    </div>
  );
}
