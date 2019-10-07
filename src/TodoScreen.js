import React from 'react';
import {
  StyleSheet,
  Text, 
  View, 
  StatusBar, 
  Platform,
  ScrollView, 
  FlatList, 
  AsyncStorage,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';

import {
  SearchBar,
  //TextInputとButtonの変わりにreact-native-elementsのInputとButtonを利用
  Input,
  Button,
  ListItem,
} from 'react-native-elements'

//ボタンのアイコンをFeatherから利用
import Icon from 'react-native-vector-icons/Feather';
//done IconがあるMaterialIconsを追加
import Icon2 from 'react-native-vector-icons/MaterialIcons';

//react-native-iphone-x-helperからifIphoneXとgetStatusBarHeightインポート
import {ifIphoneX, getStatusBarHeight} from 'react-native-iphone-x-helper'

//OSごとの処理を getStatusBarHeight()に置き換え
const STATUSBAR_HEIGHT = getStatusBarHeight()

//react-reduxのconnect関数とactionCreatorsをインポート
import { connect } from 'react-redux'
import { addTodo,toggleTodo } from './actionCreators'

//TODOを保存するKey/Valueストアのキーを定義
const TODO = "@todoapp.todo"

//TodoItemでTextではなくListItemを返すようにする
const TodoItem = (props) => {
  //スタイルの入れ替えではなくアイコンの差し替えをするように変更
  let icon = null
  if (props.done === true) {
    icon = <Icon2 name="done" />
  }
  return (
    <TouchableOpacity onPress={props.onTapTodoItem}>
      <ListItem
        title={props.title}
        rightIcon={icon}
        bottomDivider
      />  
    </TouchableOpacity>
  )
}

class TodoScreen extends React.Component{
  // コンストラクタを定義
  constructor(props){
    super(props)
    // stateを初期化
    this.state = {
      inputText:"",   //テキスト入力用の箱を用意
      filterText: "", //filter用のテキストを追加
    }
  }

  //TODOリストへの追加処理
  onAddItem = () => {
    const title = this.state.inputText
    if (title == ""){
      return
    }
    //処理をactionCreatorsのtoggleTodoを使うように変更
    this.props.addTodo(title)
    this.setState({
      inputText: ""
    })
  }
  //TODOリストをタップした時の処理
    onTapTodoItem = (todoItem) => {
      //処理をactionCreatorsのtoggleTodoを使うように変更
      this.props.toggleTodo(todoItem)
    }
  
  render(){
    //フィルター処理
    const filterText = this.state.filterText
    let todo = this.props.todos
    if (filterText !== "") {
      todo = todo.filter(t => t.title.includes(filterText))
    }
    //SearchBarのplatformを決定
    const platform = Platform.OS == 'ios' ? 'ios' : 'android'
    return (
      <KeyboardAvoidingView style = {styles.container} behavior= "padding">
        {/*SearchBarを実装 */}
        <SearchBar
          platform={platform}
          cancelButtonTitle="Cancel"
          onChangeText={(text) => this.setState({filterText: text})}
          onClear={() => this.setState({filterText: ""})}
          value={this.state.filterText}
          placeholder="検索"
        />  
          <ScrollView style={styles.todolist}>
            {/* FlatListを実装&データをフィルタした結果となるように修正*/}
            <FlatList data={todo}
              extraData={this.state}
              renderItem={({item}) =>
                <TodoItem
                  title={item.title}
                  done={item.done}
                  onTapTodoItem={() => this.onTapTodoItem(item)}
                />
              }
              keyExtractor={(item,index) => "todo_" + item.index}
              />
          </ScrollView>
          {/* 入力スペース */}
          <View style={styles.input}>
            {/*テキスト入力とボタンを追加 */}
            <Input
              onChangeText={(text) => this.setState({inputText: text})}
              value={this.state.inputText}
              containerStyle={styles.inputText}
            />
            {/*Buttonをアイコンのみのボタンにする */}
            <Button
              icon={
                <Icon
                  name='plus'
                  size={30}
                  color='white'
                />
              }
              title=""
              onPress={this.onAddItem}
              buttonStyle={styles.inputButton}
            />
          </View>
        </KeyboardAvoidingView>  
    );
  }
}

//todoReducerのstateをpropsへマップする関数を定義
const mapStateToProps = state => {
  return {
    todos: state.todos.todos,
  }
}

//actionCreatorの関数をpropsへマップする関数を定義
const mapDispatchToProps = dispatch => {
  return {
    addTodo(text) {
      dispatch(addTodo(text))
    },
    toggleTodo(todo) {
      dispatch(toggleTodo(todo))
    }
  }
}

/*connect()関数を使ってTodoScrrenコンポーネントと
stateとactiocCreatorsを繋げたコンポーネントをdefaultで返すようにする*/
export default connect(mapStateToProps, mapDispatchToProps)(TodoScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    //paddingTopにスタータスバーの高さを指定して下にずらす
    paddingTop: STATUSBAR_HEIGHT,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  //追加したUIのスタイル
  filter: {
    height: 30,
  },
  todolist: {
    flex: 1,
  },
  //TODO表示用スタイル
  todoItem: {
    fontSize: 20,
    backgroundColor: "white",
  },
  todoItemDone: {
    fontSize: 20,
    backgroundColor: "red",
  },
  //inputの高さ調整とボタンの配置位置の調整のためpaddingRightを追加
  input: {
    ...ifIphoneX({
      paddingBottom: 30,
      height: 80,
    },{
      height: 50,
    }),
    height: 70,
    flexDirection: 'row',
    paddingRight: 10,
  },
  //テキスト入力欄もpaddingを入れて配置を綺麗に
  inputText: {
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
  },
  //円形のボタンを作成するため幅と同じ大きさのborderRadiusを入れるß
  inputButton: {
    width: 48,
    height: 48,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 48,
    backgroundColor: '#ff6347',
  },
});
