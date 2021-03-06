import {Service} from "feathers-mongoose"

import {standardPerms} from "../core/hooks"
import {escapeJSON} from "../core/sanitize"

import lesson from "../models/lesson"
import {LESSON} from "../constants/api"

class LessonService extends Service {

  find(params) {
    return super.find(params)
  }

  get(id, params) {
    return super.get(id, params)
  }

  create(data, params) {
    return super.create(escapeJSON(data), params)
  }

  update(id, data, params) {
    return super.update(id, escapeJSON(data), params)
  }

  patch(id, data, params) {
    return super.patch(id, escapeJSON(data), params)
  }

}

export default function lessons() {
  this.use(LESSON, new LessonService({
    Model: lesson,
    paginate: {
      default: 15,
      max: 25
    }
  }))

  this.service(LESSON).before(standardPerms)
}
