import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import { rotulo_input_meta, rotulo_btn_cadastro_meta, rotulo_lista_metas } from './mensagens';
import {useState} from 'react';
import MetasList from './components/MetasList';
import MetaInput from './components/MetaInput';

export default function App() {

  const [metas, setMetas] = useState([]);
  function adicionarMetaHandler(meta){
    setMetas([...metas, meta])
  }

  return (
    <View style={styles.mainContainer}> 

      <MetaInput onAddMeta={adicionarMetaHandler}/>

      <View style={styles.metaContainer}>
            <Text>{rotulo_lista_metas}</Text>
            <MetasList array={metas}/>
      </View> 

    </View>
    
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    padding: 30,
    flex:1,
    flexDirection:'column'
  },
  metaContainer: {
    flex: 15
  }
});
