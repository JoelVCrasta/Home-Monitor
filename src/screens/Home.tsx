import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';

const Home = () => {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [harmful, setHarmful] = useState<boolean | null>(false);
  const [comfort, setComfort] = useState<number | null>(null);

  useEffect(() => {
    async function requestPermissions() {
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
        console.log('Permission not granted');
      }
    }

    requestPermissions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let { data, error } = await supabase
        .from('homemonitor')
        .select('temp,humid,harmful')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching data:', error.message);
        return;
      }
      if (data) {
        setTemperature(Number(data[0].temp));
        setHumidity(Number(data[0].humid));
        if (data[0].harmful == true) {
          setHarmful(true);
        } else {
          setHarmful(false);
        }
        const comfort1 = calculateComfortIndex(
          Number(data[0].temp),
          Number(data[0].humid),
        );
        setComfort(comfort1);
      }
    };
    fetchData();

    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (harmful) {
      showNotification();
    }
  }, [harmful]);

  function calculateComfortIndex(
    temperatureCelsius: number,
    humidityPercentage: number,
  ): number | null {
    const temperatureFahrenheit = (temperatureCelsius * 9) / 5 + 32;
    const comfortIndex =
      -42.379 +
      2.04901523 * temperatureFahrenheit +
      10.14333127 * humidityPercentage -
      0.22475541 * temperatureFahrenheit * humidityPercentage -
      6.83783e-3 * Math.pow(temperatureFahrenheit, 2) -
      5.481717e-2 * Math.pow(humidityPercentage, 2) +
      1.22874e-3 * Math.pow(temperatureFahrenheit, 2) * humidityPercentage +
      8.5282e-4 * temperatureFahrenheit * Math.pow(humidityPercentage, 2) -
      1.99e-6 *
        Math.pow(temperatureFahrenheit, 2) *
        Math.pow(humidityPercentage, 2);

    console.log(comfortIndex);

    if (comfortIndex < 40) {
      return 1;
    } else if (comfortIndex < 80) {
      return 2;
    } else if (comfortIndex < 120) {
      return 3;
    } else if (comfortIndex < 160) {
      return 4;
    } else {
      return 5;
    }
  }

  const showNotification = async () => {
    const channelId = await notifee.createChannel({
      id: 'harmful_channel',
      name: 'Harmful Conditions',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: 'Home Monitor',
      body: 'Smoke or gas leak detected in your home. Please check immediately.',
      android: {
        channelId,
        sound: 'alert',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Home Monitor</Text>
      </View>
      <View style={styles.box}>
        <View style={styles.boxBorder}>
          <Text style={styles.boxText}>Temperature : {temperature} °C </Text>
        </View>
        <View style={styles.boxBorder}>
          <Text style={styles.boxText}>Humidity : {humidity}%</Text>
        </View>
        <View style={styles.boxBorder}>
          <Text style={styles.boxText}>
            {comfort === 1
              ? 'Comfort Level : Very Cold'
              : comfort === 2
              ? 'Comfort Level : Cold'
              : comfort === 3
              ? 'Comfort Level : Comfortable'
              : comfort === 4
              ? 'Comfort Level : Warm'
              : 'Comfort Level : Hot'}
          </Text>
        </View>
      </View>
      {harmful && (
        <View style={styles.smokeBox}>
          <Text style={styles.smokeText}>Smoke / Gas Leak Detected.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
  },
  header: {
    backgroundColor: '#669bbc',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#003049',
  },
  headerText: {
    color: '#003049',
    fontSize: 32,
    fontWeight: '900',
  },
  box: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxBorder: {
    borderColor: '#003049',
    backgroundColor: '#dbe2ef',
    borderWidth: 4,
    borderRadius: 10,
    width: 350,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  boxText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#003049',
  },
  smokeBox: {
    backgroundColor: '#ff5252',
    padding: 10,
    margin: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  smokeText: {
    color: '#780000',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default Home;
