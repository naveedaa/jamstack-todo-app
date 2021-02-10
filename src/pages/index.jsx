import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { Button } from "@material-ui/core";
import DeleteSharpIcon from "@material-ui/icons/DeleteSharp";
import "./style.css";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      "& > *": {
        margin: theme.spacing(1),
        width: "25ch",
      },
    },
  })
);

const GET_TODOS = gql`
  query {
    todos {
      id
      task
      done
    }
  }
`;

const ADD_TODO = gql`
  mutation addTodo($task: String!) {
    addTodo(task: $task) {
      id
      task
      done
    }
  }
`;

const DELETE_TODO = gql`
  mutation deleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      id
      task
      done
    }
  }
`;

const UPDATE_TASK = gql`
  mutation checkedTodo($id: ID!, $done: Boolean) {
    checkedTodo(id: $id, done: $done) {
      id
      done
    }
  }
`;

const Home = () => {
  const [task, setTask] = useState("");

  const [addTodo, { loading: adding}] = useMutation(ADD_TODO);
  const [deleteTodo, { loading: deleting}] = useMutation(DELETE_TODO);
  const addTask = () => {
    addTodo({
      variables: {
        task: task,
      },
      refetchQueries: [{ query: GET_TODOS }],
    });
    setTask("");
  };

  function handleDelete(id) {
    deleteTodo({
      variables: {
        id: id,
      },
      refetchQueries: [{ query: GET_TODOS }],
    });
  }

  const [checkedTodo] = useMutation(UPDATE_TASK);

  const { loading, error, data } = useQuery(GET_TODOS);

  const classes = useStyles();

  if (loading) {
    return (
        <div>Loading...</div>
      );
  }

  if (error) {
    return (
      <div>error...</div>
    );
  }
  return (
    <div className="todoMain">
      <h1>TODO APP</h1>
      <form className={classes.root} noValidate autoComplete="off">
        <TextField
          id="outlined-basic"
          label="Add Todo"
          variant="outlined"
          required
          value={task}
          onChange={(e) => setTask(e.target.value)}
          fullWidth
        />
      </form>
      <div>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={addTask}
      >
        Add Todo
      </Button>
      {adding && <p style={{fontWeight : "bold"}}>adding data ...</p>}
      </div>
      {data &&
        data.todos.map((d) => {
          return (
            <div className="list" key={d.id}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={d.done}
                      onClick={async () => {
                        checkedTodo({
                          variables: {
                            id: d.id,
                            done: !d.done,
                          },
                          refetchQueries: [{ query: GET_TODOS }],
                        });
                      }}
                      name="checkedB"
                      color="primary"
                    />
                  }
                  label={d.task}
                />
              </FormGroup>
              <i className="icons" onClick={() => handleDelete(d.id)}>
                <DeleteSharpIcon />
              </i>
            </div>
          );
        })}
         {deleting && <p style={{fontWeight : "bold"}}>removing data ...</p>}
    </div>
  );
};

export default Home;







             
    
            