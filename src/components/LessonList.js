import React, {Component} from "react"
import {Link} from "react-router"
import {connect} from "react-redux"

import concat from "lodash.concat"
import reject from "lodash.reject"

import GridList from "./GridList"
import Paper from "./Paper"
import TextField from "./TextField"
import Grid from "./Grid"
import Role from "./Role"
import Cover from "./Cover"

import {app} from "../constants/api"
import {setLessonList} from "../actions/lesson"

import {CDN_URL} from "../constants/visual"
import {LESSON_API, LESSON_URL} from "../constants/api"

class LessonList extends Component {

  static contextTypes = {
    store: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      search: ""
    }
  }

  componentDidMount = () => {
    Waves.init()
    Waves.attach(".waves")
    if (this.props.lessons) {
      if (typeof this.props.lessons[0] === "undefined") {
        if (this.props.user.hasOwnProperty("_id")) {
          this.search("")
        }
      }
    } else {
      if (this.props.user.hasOwnProperty("_id")) {
        this.search("")
      }
    }

    const lesson = app.service(LESSON_API)
    lesson.on("created", res => {
      const c = this.props.lessons
      c.data = concat(c.data, res)
      this.props.setLessonList(c)
    })
    lesson.on("patched", () => {
      this.search("")
    })
    lesson.on("removed", res => {
      const c = this.props.lessons
      c.data = reject(c.data, res)
      this.props.setLessonList(c)
    })
  }

  componentWillReceiveProps = props => {
    if (props !== this.props) {
      if (props.classId !== this.props.class._id) {
        console.log("LessonList Props Change Detected!", props.classId, this.props.class._id)
        this.search("")
      }
    }
  }

  componentWillUnmount = () => {
    ["created", "removed", "patched"].forEach(e => app.service(LESSON_API).off(e))
  }

  search = (v, classId = this.props.classId) => {
    this.setState({search: v})
    app.service(LESSON_API).find({
      query: {
        $select: ["_id", "url", "name", "description", "thumbnail", "color", "section"],
        name: {
          $regex: v,
          $options: "ig"
        },
        parentCourse: classId
      }
    })
    .then(e => {
      console.info(`[LESSONLIST SEARCH] classId: ${classId}, search: ${v}, result: ${e}`)
      this.props.setLessonList(e)
      Waves.init()
      Waves.attach(".waves")
    })
    .catch(e => {
      swal("Error", e, "error")
    })
  }

  render = () => (
    <div style={this.props.style}>
      <Paper style={{marginTop: this.props.top}}>
        <TextField
          label="ค้นหาบทเรียน" // Lesson Search
          value={this.state.search}
          onChange={v => this.search(v.target.value)}
        />
      </Paper>
      <div>
        {
          this.props.sections ? this.props.sections.map((sect, sIndex) => (
            <Grid key={sIndex} r>
              <Grid xs={12}>
                <Paper
                  outerChild={
                    <div
                      style={{
                        background: "linear-gradient(to left, rgb(116, 116, 191), rgb(52, 138, 199))",
                        paddingLeft: "2em",
                        paddingTop: "0.5em",
                        paddingBottom: "0.5em",
                        color: "#fefefe",
                        fontSize: "1.1em"
                      }}
                    >
                      <h2>{sect.name}</h2>
                      <p>{sect.description}</p>
                    </div>
                  }
                >
                  <Grid r>
                    {
                      this.props.lessons ? this.props.lessons.map((e, i) => {
                        if (String(e.section) === String(sect._id)) {
                          return (
                            <Grid key={i} xs={12} sm={6} md={4}>
                              <Grid>
                                <Link to={`${LESSON_URL}${e.url}`} style={{textDecoration: "none"}}>
                                  <Paper
                                    className="waves waves-light waves-block"
                                    padding="1em"
                                    bottom="0em"
                                    fontSize="0.9em"
                                    style={{marginBottom: "1.5em"}}
                                    outerChild={
                                      <Cover
                                        marginBottom="0em"
                                        height="9em"
                                        alpha="0"
                                        src={e.thumbnail}
                                        attachment="scroll"
                                      />
                                    }
                                  >
                                    <span style={{fontWeight: 300, fontSize: "1.3em"}}>
                                      {e.name}
                                    </span>
                                    <br />
                                    <span style={{fontWeight: 300, fontSize: "1em"}}>
                                      {e.description}
                                    </span>
                                  </Paper>
                                </Link>
                              </Grid>
                            </Grid>
                          )
                        }
                        return null
                      }) : null
                    }
                    <Role is="teacher">
                      <Grid xs={12} sm={6} md={4}>
                        <Grid>
                          <Link to="#!" style={{textDecoration: "none"}}>
                            <div onClick={() => this.props.new(sect._id)}>
                              <Paper
                                className="waves waves-light waves-block"
                                padding="1em"
                                bottom="0em"
                                fontSize="0.9em"
                                style={{marginBottom: "1.5em"}}
                                outerChild={
                                  <Cover
                                    marginBottom="0em"
                                    height="9em"
                                    alpha="0"
                                    src={`${CDN_URL}/images/add.jpg`}
                                    attachment="scroll"
                                  />
                                }
                              >
                                <span style={{fontWeight: 300, fontSize: "1.3em"}}>
                                  เพิ่มเนื้อหาลงในส่วนนี้
                                </span>
                                <br />
                                <span style={{fontWeight: 300, fontSize: "1em"}}>
                                  ...
                                </span>
                                <br />
                              </Paper>
                            </div>
                          </Link>
                        </Grid>
                      </Grid>
                    </Role>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )) : (
            <GridList
              data={this.props.lessons}
              url={LESSON_URL}
              new={this.props.new}
              cTitle="สร้างโน๊ต"
              c
            />
          )
        }
      </div>
    </div>
  )

}

const mapStateToProps = state => ({
  lessons: state.lesson.list.data,
  class: state.classes.data,
  user: state.user
})

const mapDispatchToProps = dispatch => ({
  setLessonList: data => dispatch(setLessonList(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(LessonList)
