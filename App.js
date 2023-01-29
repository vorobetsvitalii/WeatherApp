import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView, RefreshControl, TextInput, TouchableOpacity, Button, FlatList, Alert, } from 'react-native';
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { vw, vh } from 'react-native-expo-viewport-units';
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {
  const [weather] = useState([]);
  const [loading, SetLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [city] = useState([]);
  const [TempCity, SetTempCity] = useState("");
  const [manageCity, SetManageCity] = useState(false)
  const [inputCity, SetInputCity] = useState(true)
  const [nameError, SetNameError] = useState("");
  const [length, SetLength] = useState(0)


  // Functions


  useEffect(() => {
    Start()
  }, []);

  const Start = async () => {
    await getAllLocal()
    if (city.length > 0) {
      console.log(false)
      SetInputCity(false)
      SetLoading(false)
    }
    else {
      SetInputCity(true)
      SetLoading(false);
    }
  }

  const getAllLocal = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      for (var i = 0; i < keys.length; i++) {
        await dataFetch(result[i][1])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const addToLocal = async (name) => {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    let b = true;
    for (var j = 0; j < result.length; j++) {
      if (name == result[j][1]) {
        b = false;
      }
    }
    if (b) {
      AsyncStorage.setItem(city.indexOf(name).toString(), name);
    }
  }

  const dataFetch = async (cityName) => {
    const data = await (
      await fetch(
        "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&lang=ua&appid=eb52de8aeec7f52c70920b17224d8628"
      )
    ).json();
    console.log(cityName)
    // set state when the data received
    if (data.cod == 200) {
      var b = true
      weather.map(item => {
        if (item.city.name == data.city.name) {
          city.pop()
          b = false
          SetNameError("Цей населений пункт вже є у вашому переліку")
        }
      })
      if (b) {
        city.push(data.city.name)
        addToLocal(data.city.name)
        weather.push(data);
        SetInputCity(false)
        return 200
      }
    }
    else if (data.cod == 404) {
      //city.pop()
      return 404;

      //SetLength(city.length)
    }
  };


  const ConfirmCity = async (name) => {
    while (name[name.length - 1] == ' ') {
      name = name.slice(0, name.length - 1)
    }
    //SetLoading(true)
    if (!city.includes(name)) {
      let a = await dataFetch(name)
      SetLoading(false)
      if (a == 200) {
        SetLoading(false)
      }
      else if (a == 404) {
        SetNameError("Такого населеного пункту не знайдено")
      }
    }
    else {
      SetNameError("Цей населений пункт вже є у вашому переліку")
      SetLoading(false)
    }
  }


  const onRefresh = async () => {
    weather.length = 0;
    return city.map(item => dataFetch(item, true))
  }




  const arrowDirection = (deg) => {
    if (deg <= 22.5 || deg >= 347.5) return "up"
    if (deg >= 22.5 && deg <= 67.5) return "top-right"
    if (deg >= 67.5 && deg <= 112.5) return "right"
    if (deg >= 112.5 && deg <= 157.5) return "bottom-right"
    if (deg >= 157.5 && deg <= 202.5) return "down"
    if (deg >= 202.5 && deg <= 247.5) return "bottom-left"
    if (deg >= 247.5 && deg <= 292.5) return "left"
    if (deg >= 292.5 && deg <= 347.5) return "top-left"
  }

  const windDirection = (deg) => {
    if (deg <= 22.5 && deg >= 347.5) return "Пн"
    if (deg >= 22.5 && deg <= 67.5) return "Пн-Сх"
    if (deg >= 67.5 && deg <= 112.5) return "Сх"
    if (deg >= 112.5 && deg <= 157.5) return "Пд-Сх"
    if (deg >= 157.5 && deg <= 202.5) return "Пд"
    if (deg >= 202.5 && deg <= 247.5) return "Пд-Зх"
    if (deg >= 247.5 && deg <= 292.5) return "Зх"
    if (deg >= 292.5 && deg <= 347.5) return "Пн-Зх"
  }

  //Views

  const hoursWeatherView = ({ item }) => (
    <View style={styles.hoursWeaterItem}>
      <Text style={{ color: "#fff" }}>{item.dt_txt[8]}{item.dt_txt[9]}-{item.dt_txt[5]}{item.dt_txt[6]}{item.dt_txt.substring(10, 16)}</Text>
      <Text style={{ color: "#fff", fontWeight: "700" }}>{item.weather[0].description}</Text>
      <View style={{flexDirection:'row', alignItems: 'center'}}>
        <MaterialCommunityIcons
          name={'arrow-' + arrowDirection(item.wind.deg) + '-thin'}
          size={vw(7)}
          style={{ color: "#fff", }}
        />
        <Text style={{ color: "#fff" }}>{Math.round(item.wind.speed)}м/c</Text>
      </View>
      <Text style={{ fontSize: vw(5), color: "#fff" }}>{Math.round(item.main.temp - 273.15)}°C</Text>
    </View>
  )

  const CityView = ({ item }) => (
    <View style={styles.cityItem}>
      <Text style={{ color: "#fff", fontSize: vw(6), marginLeft: vw(3) }}>{item.city.name}</Text>
      <Ionicons
        name='location-outline'
        size={vw(7)}
        style={{ color: "#fff" }}
      />
      <TouchableOpacity
        style={{ position: 'absolute', marginLeft: vw(85) }}
        onPress={() => {
          Alert.alert(
            '',
            'Ви дійсно бажаєте вилучити місто ' + item.city.name + ' з вашого списку?',
            [
              {
                text: 'Ні',
                onPress: () => {
                  console.log(weather)
                }
              },
              {
                text: 'Так',
                onPress: () => {
                  SetLength(city.length)
                  const index = city.indexOf(item.city.name)
                  weather.splice(index, 1)
                  AsyncStorage.removeItem(city.indexOf(item.city.name).toString())
                  city.splice(index, 1)
                  SetLength(city.length)
                  if (city.length == 0) {
                    SetManageCity(false)
                    SetInputCity(true)
                  }
                }
              },
            ],
          );
        }}
      >
        <SimpleLineIcons
          name='minus'
          size={vw(7)}
          color={"#fff"}
        />
      </TouchableOpacity>
    </View>
  )


  //Screens


  const LoadingScreen = () => {
    return (
      <LinearGradient
        colors={['#0066ff', "#00abff", "#00ffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <StatusBar backgroundColor='#0066ff' />
        <OrientationLoadingOverlay
          visible={true}
        />
      </LinearGradient>
    )
  }

  const manageCityScreen = () => {
    return (
      <LinearGradient
        colors={['#0066ff', "#00abff", "#00ffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <StatusBar backgroundColor='#0066ff' />
        <MaterialCommunityIcons
          name='arrow-left'
          size={vw(7)}
          style={{ marginTop: vh(7), marginLeft: vw(3), color: '#fff' }}
          onPress={() => {
            SetManageCity(false)
          }}
        />
        <FlatList
          renderItem={CityView}
          data={weather}
          //style={{ marginTop: vh(6) }}
          extraData={length}
          keyExtractor={(item) => item.city.name}
        />
        <TouchableOpacity style={styles.addCity}
          onPress={() => {
            SetInputCity(true)
            SetManageCity(false)
          }
          }
        >
          <Text style={{ color: '#fff', fontSize: vw(10), fontWeight: '700' }}>+</Text>
          <Text style={{ color: '#fff', fontSize: vw(6) }}>Додати місто</Text>
        </TouchableOpacity>
      </LinearGradient>
    )
  }

  const InputCity = () => {
    return (
      <LinearGradient
        colors={['#0066ff', "#00abff", "#00ffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <StatusBar backgroundColor='#0066ff' />
        <View style={styles.inputCity}>
          <TextInput
            onChangeText={TempCity => SetTempCity(TempCity)}
            placeholder='Введіть місто'
            style={styles.textInput}
          />
        </View>
        <Text style={{ alignSelf: "center" }}>{nameError}</Text>
        <TouchableOpacity style={styles.confirmButton}
          onPress={() => {
            if (TempCity.length == 0) {
              SetNameError("Це обов'язкове поле")
            }
            else {
              SetNameError("")
              SetTempCity("")
              SetLoading(true)
              ConfirmCity(TempCity);
            }
          }}
        >
          <Text style={styles.confirm_text}>Підтвердити</Text>
        </TouchableOpacity>
      </LinearGradient>
    )
  }

  const MainScreen = ({ item }) => {
    return (
      <LinearGradient
        colors={['#0066ff', "#00abff", "#00ffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <StatusBar backgroundColor='#0066ff' />
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <Text
            style={styles.cityChange}
            onPress={() => {
              SetManageCity(true)
            }}
          >Керування містами</Text>
          <View style={styles.location}>
            <View style={{ flexDirection: "row" }}>
              <Ionicons
                name='location-outline'
                size={vw(7)}
                style={{ color: "#fff" }}
              />
              <Text style={styles.city_style}>{item.city.name}</Text>
            </View>
            <Text style={styles.temp_now}>{Math.round(item.list[0].main.temp - 273.15)}°C</Text>
            <Text style={styles.description}>{item.list[0].weather[0].description}</Text>
            <View style={{ flexDirection: "row", fontColor: "#fff" }}>
              <Text style={styles.wind}>Вітер: {windDirection(item.list[0].wind.deg)} </Text>
              <MaterialCommunityIcons
                name={'arrow-' + arrowDirection(item.list[0].wind.deg) + '-thin'}
                size={vw(7)}
                style={{ color: "#fff" }}
              />
              <Text style={styles.wind}> {item.list[0].wind.speed}м/с</Text>
            </View>
          </View>
          <View style={{ marginTop: vh(5) }}>
            <View style={{ justifyContent: "center", alignItems: "center", marginBottom: vw(5) }}>
              <Text style={{ fontSize: vw(5), color: "#fff", fontWeight: "500" }}>Прогноз погди на 5 днів</Text>
            </View>
            <ScrollView horizontal={true} >
              <FlatList
                data={item.list}
                renderItem={hoursWeatherView}
                scrollEnabled={false}
              />
            </ScrollView>
          </View>
        </ScrollView>
      </LinearGradient>
    )
  }

  return (
    loading ? LoadingScreen() :
      !inputCity ?
        manageCity ? manageCityScreen() :
          <FlatList
            data={weather}
            renderItem={MainScreen}
            horizontal={true}
            snapToAlignment="start"
            snapToInterval={vw(100)}
          />
        : InputCity()
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "blue",
  },
  linearGradient: {
    flex: 1
  },
  location: {
    marginTop: vh(8),
    alignSelf: "center",
    alignItems: 'center'
  },
  city_style: {
    fontSize: vw(6),
    fontWeight: '600',
    color: "#fff"
  },
  temp_now: {
    fontSize: vw(15),
    color: "#fff",
  },
  description: {
    color: "white",
    fontWeight: "700",
  },
  wind: {
    color: '#fff',
    fontSize: vw(5)
  },
  inputCity: {
    alignSelf: "center",
    width: vw(80),
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    height: 40,
    marginTop: vh(45),
    justifyContent: "center"
  },
  confirmButton: {
    width: vw(50),
    height: vh(5),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#369cff",
    marginTop: vh(4),
    borderRadius: 15
  },
  confirm_text: {
    color: "#fff",
    fontSize: vh(2.3),
    fontWeight: "500"
  },
  hoursWeaterItem: {
    alignItems: "center",
    justifyContent: 'space-between',
    width: vw(100),
    height: vh(5),
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1
  },
  cityItem: {
    alignItems: 'center',
    width: vw(100),
    height: vh(10),
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1
  },
  cityChange: {
    width: vw(20),
    position: "absolute",
    color: "#fff",
    alignSelf: "flex-end",
    marginTop: vw(15)
  },
  addCity: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  }
});
