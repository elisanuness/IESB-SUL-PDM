import { View, Text, StyleSheet } from 'react-native';

function DespesaSumario({despesas, periodo}) {

    const somaDespesas = despesas.reduce((total, despesa) => {
        return total + despesa.valor;
    }, 0);

    return (
        <View style={styles.container}>
            <Text style={styles.texto}>{periodo}</Text>
            <Text style={styles.texto}>R$ {somaDespesas.toFixed(2)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#A0A0A0',
        padding: 12,
    },
    texto: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default DespesaSumario;