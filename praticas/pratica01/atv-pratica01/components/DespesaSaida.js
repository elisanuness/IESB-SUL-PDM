import { View, StyleSheet } from 'react-native';
import DespesaSumario from './DespesaSumario';
import DespesaLista from './DespesaLista';

function DespesaSaida ({despesas, periodo}) {
    return (
        <View style={styles.container}>
            <DespesaSumario despesas={despesas} periodo={periodo}/>
            <DespesaLista despesas={despesas}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5' 
    }
});

export default DespesaSaida;