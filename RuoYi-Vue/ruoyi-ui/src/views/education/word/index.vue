<template>
  <div class="app-container">
    <el-form :model="form" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Grade" prop="postCode">
        <el-input
          v-model="currGradeName"
          readonly="true"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="class" prop="classId">
        <el-select v-model="form.classId" placeholder="class" clearable size="small">
          <el-option
            v-for="dict in classAllList"
            :key="dict.id"
            :label="dict.className"
            :value="dict.id"
          />
        </el-select>
        </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div>
        <el-button-group>
          <el-button type="primary" icon="el-icon-arrow-left" @click="lastGroupWord">Last Group</el-button>
          <el-button type="primary" @click="nextGroupWord">Next Group<i class="el-icon-arrow-right el-icon--right"></i></el-button>
        </el-button-group>      
        <h3>当前Group：{{this.currGroupId}}单词数：{{this.groupWordEnList.length}}</h3>
    </div>
    
    <div>
      <el-image
      style="width: 300px; height: 300px; margin:2px"
      :src= groupWordPic[0]
      ></el-image>
      <el-image
      style="width: 300px; height: 300px; margin:2px"
      :src= groupWordPic[1]
      ></el-image>
      <el-image
      style="width: 300px; height: 300px; margin:2px"
      :src=groupWordPic[2]
      ></el-image>
      <el-image
      style="width: 300px; height: 300px; margin:2px"
      :src=groupWordPic[3]
      ></el-image>
      <el-image
      style="width: 300px; height: 300px; margin:2px"
      :src= groupWordPic[4]
      ></el-image>
      <el-image
      style="width: 300px; height: 300px; margin:2px"
      :src=groupWordPic[5]
      ></el-image>
      <el-image
      style="width: 300px; height: 300px; margin:2px"
      :src=groupWordPic[6]
      ></el-image>
      <el-image
      style="width: 300px; height: 300px; margin:2px"
      :src= groupWordPic[7]
      ></el-image>
      <el-image
      style="width: 300px; height: 300px; margin:2px"
      :src=groupWordPic[8]
      ></el-image>

    </div>
    <div>
      <h3>{{this.groupWordEnList}}</h3>
    </div>
    <div>
      <h3>{{this.groupWordZhList}}</h3>
    </div>
  </div>
</template>

<script>
import { listPost, getGroupWordByGrouIdClassId, getWordClassAllList} from "@/api/education/word";
import { getToken } from "@/utils/auth";

export default {
  name: "Post",
  data() {
    return {
      currGradeName: "高中英语",
      classAllList: [],
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      groupWordPic: ['http://192.168.1.44/dev-api/profile/avatar/2021/04/17/81b9b41b-621e-4ca6-b761-3b9619d9432b.jpg'],
      currGroupId: 1,
      groupWordEnList: [],
      groupWordZhList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        postCode: undefined,
        postName: undefined,
        status: undefined
      },
      // 表单参数
      form: {
        gradeId: 1,
        classId: 1
      }
      // 表单校验

    };
  },
  created() {
    this.setGradIdBeforCreatePage();
    //get class by grade 1
    this.getWordClassAllList();
    //get group words Map<groupId, List<Word>>
    this.getGroupWordByGrouIdClassId();

    this.getList();

  },
  methods: {
    setGradIdBeforCreatePage() {
      var currPagePath = this.$route.path;
      if (currPagePath.indexOf("geducation") != -1) {
        this.form.gradeId = 1;
        this.currGradeName = "高中英语";
      }else if (currPagePath.indexOf("4education") != -1) {
        this.form.gradeId = 2;
        this.currGradeName = "四级英语";
      }else if (currPagePath.indexOf("6education") != -1) {
        this.form.gradeId = 3;
        this.currGradeName = "六级英语";
      }else if (currPagePath.indexOf("yeducation") != -1) {
        this.form.gradeId = 4;
        this.currGradeName = "雅思英语";
      }

    },

    getWordClassAllList() {
      getWordClassAllList().then(response => {
              this.classAllList = response;
            });
    },

    getGroupWordByGrouIdClassId() {
      
      this.form["groupId"]  = this.currGroupId;

      getGroupWordByGrouIdClassId(this.form).then(data => {
        this.groupWordPic = [];
        this.groupWordEnList = [];
        this.groupWordZhList = [];
        if (data.length > 0) {
          console.log("getGroupWordByGrouIdClassId" + data[0].wordPic);

        data.forEach(element => {
          // var src = 'http://106.54.133.155/prod-api' + element.wordPic;
          var src = 'http://192.168.1.44/dev-api' + element.wordPic;

          console.log("getGroupWordByGrouIdClassId" + src);
          this.groupWordPic.push(src);

          var wordEn = element.wordEn;
          this.groupWordEnList.push(wordEn);
          var wordZh = element.wordCn;
          this.groupWordZhList.push(wordZh);
        });
        }
        
      });
    },

    nextGroupWord() {
      this.currGroupId = this.currGroupId + 1;
      console.log("nextGroupWord" + this.currGroupId);
      this.getGroupWordByGrouIdClassId();

    },
    lastGroupWord() {
      console.log("lastGroupWord" + this.currGroupId);
      var curr = this.currGroupId;
      if (curr > 1) {
        this.currGroupId = curr - 1;
        this.getGroupWordByGrouIdClassId();
      }
    },

    /** 查询岗位列表 */
    getList() {
      this.loading = true;
      listPost(this.queryParams).then(response => {
        this.postList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    
    showSearch() {

    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.currGroupId = 1;
      this.getGroupWordByGrouIdClassId();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    }
  }
};
</script>