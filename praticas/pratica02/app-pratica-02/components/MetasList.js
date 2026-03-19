import { StyleSheet, Text, ScrollView } from "react-native";

function MetasList(props){
        return(
            <ScrollView>{props.array.map((meta, index) => <Text key={index} 
            style={styles.item}>{meta}</Text>)}
            </ScrollView>
        );
};

export default MetasList

const styles = StyleSheet.create({
  item:{
    margin:8,
    borderRadius:5,
    padding:10,
    backgroundColor: 'lightblue'
  }

});
