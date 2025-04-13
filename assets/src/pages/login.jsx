import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AuthContext } from '../js/auth/authContext.jsx';
import { baseService } from '../js/general/baseservice.js';
import { Picker } from '@react-native-picker/picker';
import ToastMessage from '../js/ToastManagement/toastMessage.jsx';


const LoginScreen = ({ navigation }) => {
    const { login: authLogin } = useContext(AuthContext); // Giriş yapmış olan kullanıcının verilerini tutuyorum.
    const [toast, setToast] = useState(null); // Uyarı bildirimleri için.
    const [employees, setEmployees] = useState(''); //O birimde çalışanların listesi.
    const [selectedEmployee, setSelectedEmployee] = useState(''); //Seçilen employee
    const [password, setPassword] = useState('');

    useEffect(() => {
        const fetchLabEmployee = async () => {
            try {
                const result = await baseService.get('Employee/GetEmployees?processArea=All');

                if (!result || !result.data) {
                    setToast({ message: 'Sunucudan veri alınamadı!', type: 'error' });
                    console.log('Sunucudan boş veri geldi:', result);
                    return;
                }

                console.log('Personeller:', result);
                const labEmployees = result.data.filter(x =>
                    x.jobDefinitions && x.jobDefinitions.some(j => j === 4)
                );

                if (labEmployees.length === 0) {
                    setToast({ message: 'Laboratuvar personeli bulunamadı!', type: 'error' });
                }

                setEmployees(labEmployees);
            }
            catch (error) {
                setToast({ message: 'İnternet bağlantı hatası!', type: 'error' });
                console.log('Personel bilgisi çekme esnasında hata:', error);
            }
        };

        fetchLabEmployee();
    }, []); // boş array sadece 1 defa çalışmasını sağlıyor, harici içindeki güncellenince de render oluyor.

    const handleLogin = () => {

        if (!employees || employees.length === 0) {
            setToast({ message: 'Bağlantı hatası! Personel verisi alınamadı.', type: 'error' });
            console.log('Login sırasında personel verisi yok. Muhtemelen internet bağlantı hatası.');
            return;
        }
        //Personel seçildikten sonra o personele ait verileri çektiğimiz kısım
        const foundEmployee = employees.find(employee => employee.registrationNumber === selectedEmployee);

        // Eğer employee bulunursa, şifreyi kontrol et
        if (foundEmployee && foundEmployee.registrationNumber === password) {
            // Giriş başarılı
            const userData = { employeeId: foundEmployee.registrationNumber, employeeName: foundEmployee.name, employeeSurname: foundEmployee.surname };
            authLogin(userData); // AuthContext ile giriş yapmış kullanıcıyı tanımlıyoruz.
            console.log('Giriş yapan kullanıcı:', userData);
            setToast({ message: 'Giriş başarılı!', type: 'success' });

            setTimeout(() => {
                navigation.replace('Home'); // Başarılı giriş sonrası ana sayfaya yönlendirme.
            }, 1000);
        } else {
            setPassword('');
            setToast({ message: 'Kullanıcı adı veya şifre hatalı!', type: 'error' });
        }
    };

    return (
        <>
            {toast && (
                <ToastMessage
                    message={toast.message}
                    type={toast.type}
                    onHide={() => setToast(null)}
                />
            )}

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                <KeyboardAwareScrollView
                    contentContainerStyle={styles.wrapper}
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid={true}
                    extraScrollHeight={30}

                >

                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../media/csaLab.jpg')}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>

                    <View style={styles.card}>
                        <Image
                            source={require('../media/csaLogo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>CSA Laboratuvar Yönetim Sistemi</Text>
                        <Text style={styles.subtext}>
                            Sisteme giriş yapabilmek için{'\n'}size verilen bilgileri kullanınız.
                        </Text>

                        <Picker
                            selectedValue={selectedEmployee}
                            style={styles.input}
                            onValueChange={(itemValue) => setSelectedEmployee(itemValue)}
                        >
                            <Picker.Item label="Personel Seçiniz" value="" />
                            {employees && employees.length > 0 && employees.map((employee) => (
                                <Picker.Item
                                    key={employee.registrationNumber}
                                    label={`${employee.name} ${employee.surname}`}
                                    value={employee.registrationNumber}
                                />
                            ))}
                        </Picker>
                        <TextInput
                            style={styles.input}
                            placeholder="Parola"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Giriş Yap</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>
        </>
    );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    wrapper: {
        flexGrow: 1,
        flexDirection: width > 768 ? 'row' : 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5a63f',
        padding: 20,
    },
    imageContainer: {
        width: width > 768 ? '60%' : '100%',
        height: 550,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    card: {
        width: width > 768 ? '30%' : '100%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        minHeight: 550,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    subtext: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default LoginScreen;
