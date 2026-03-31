import { View, Text, Pressable, StyleSheet } from 'react-native';

function getDataFormatada(data) {
    return data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear();
}

function DespesaItem({ item }) {
    return (
        <Pressable>
            <View style={styles.itemContainer}>
                <Text style={[styles.itemText, styles.data]}>{getDataFormatada(item.data)}</Text>
                <Text style={[styles.itemText, styles.descricao]}>{item.descricao}</Text>
                <Text style={[styles.itemText, styles.valor]}>R$ {item.valor}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        padding: 12,
        marginVertical: 1, 
        backgroundColor: '#DCDCDC', 
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 13,
        color: '#333',
    },
    data: {
        width: 85, 
    },
    descricao: {
        flex: 1, 
        paddingHorizontal: 8,
    },
    valor: {
        fontWeight: 'normal',
    }
});

export default DespesaItem;