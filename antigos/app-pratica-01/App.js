import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
//import { titulo } from './util'; // Importa variável definida
//import qualquerCoisa from './util' //Importa a variável por default
//import { Button } from 'react-native'; //Importa um botão


//Meu próprio projeto:
import { rotulo_input_meta, rotulo_btn_cadastro_meta, rotulo_lista_metas } from './mensagens';


export default function App() {

  return (
    <View style={styles.mainContainer}>

      {/*Styling e posicionamento básico de componentes:*/}
      <View style={{width:150, position:'absolute', left:5, top:30}}>
            <TextInput style={styles.inputText} placeholder={rotulo_input_meta} />
      </View>

      <View style={{width:150, position:'absolute', right:5, top:30}}>
            <Button title={rotulo_btn_cadastro_meta}/>
      </View> 
      <View style={{width:150, position:'absolute', left:5, top:80}}>
            <Text>{rotulo_lista_metas}</Text>
      </View> 

    </View>

    /*<View style={{flex:1, backgroundColor: '#ccc', alignItems: 'center', justifycontent: 'center'}}>
    -> Modificando estilo sem a função styles (Inline)
    </View> */
    
  );
}

const styles = StyleSheet.create({
  container: { // Propriedade de Estilo
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center', // Centraliza Verticalmente
    justifyContent: 'center', // Centraliza Horizontalmente
  },
  mainContainer: {
    padding: 30,
  }, inputText: {
    borderColor: '#cccccc',
    borderWidth: 1
  }

  /*Exemplos de Propriedades de Estilo:
  text: { 
    padding: 30,
  },
  button: {
    backgroundColor: 'red',
  }*/

});
