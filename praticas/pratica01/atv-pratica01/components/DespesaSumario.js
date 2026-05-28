import { View, Text, StyleSheet } from 'react-native';

//Recebe o período em que as compras foram realizadas e a lista de compras
function DespesaSumario({despesas, periodo}) {

    //Efetua a soma das compras:
        //Função reduce((acumulador, valorAtual){return novoAcumulador},valorInicial);
        //Reduz o array à um único valor e aplica um acumulador
    const somaDespesas = despesas.reduce((total, despesa) => {
        return total + despesa.valor;
    }, 0);

    return (
        <View style={styles.container}>
            <Text style={styles.texto}>{periodo}</Text>
            <Text style={styles.texto}>R$ {somaDespesas.toFixed(2)}</Text>{/*toFixed é usado para arredondamento */}
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