<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Grade" prop="gradeId">
        <el-input
          v-model="queryParams.gradeId"
          placeholder="请输入gradeId"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Class" prop="classId">
        <el-select v-model="queryParams.classId" placeholder="Class" clearable size="small">
          <el-option
            v-for="dict in classAllList"
            :key="dict.id"
            :label="dict.className"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="WordEn" prop="wordEn">
        <el-input
          v-model="queryParams.wordEn"
          placeholder="请输入wordEn"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['education:english:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:post:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:post:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
        >导出</el-button>
      </el-col>
      <el-upload
        class="upload-demo"
        action="http://localhost:8080/education/english/uploadFile"
        :before-upload="handlePreview"
        :headers= headers
        :data= this.currWordId
        multiple>
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Grade编号" align="center" prop="gradeId" />
      <el-table-column label="class编号" align="center" prop="classId" />
      <el-table-column label="Group编号" align="center" prop="groupId" />
      <el-table-column label="Word编号" align="center" prop="id" />
      <el-table-column label="英文" align="center" prop="wordEn"/>
      <el-table-column label="中文" align="center" prop="wordCn"/>
      <el-table-column label="图片" align="center" prop="wordPic"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:post:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:post:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改岗位对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="class" prop="classId">
        <el-select v-model="form.classId" placeholder="select class" clearable size="small">
          <el-option
            v-for="dict in classAllList"
            :key="dict.id"
            :label="dict.className"
            :value="dict.id"
          />
        </el-select>
        </el-form-item>

        <el-form-item label="Group状态" prop="groupState">
        <el-select v-model="form.groupState" placeholder="Group状态" clearable size="small">
          <el-option
            v-for="dict in groupStatusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
        </el-form-item>
        <el-form-item label="英文" prop="wordEn">
          <el-input v-model="form.wordEn" placeholder="请输入英文" />
        </el-form-item>
        <el-form-item label="中文" prop="wordCn">
          <el-input v-model="form.wordCn" placeholder="请输入中文" />
        </el-form-item>
        <el-form-item label="GroupId" prop="groupId">
          <el-input v-model="form.groupId" placeholder="请输入groupID" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPost, getWordInforByWordId, updateWordByWordId, deleteEnglishWordById, addWord,getWordClassAllList,  exportPost } from "@/api/education/english";
import { VueCropper } from "vue-cropper";
import { uploadAvatar } from "@/api/system/user";
import { getToken } from "@/utils/auth";

export default {
  name: "Post",
  data() {
    return {
      classAllList: [],
      currWordId: {},
      groupStatusOptions: [{
          value: 1,
          label: '当前Group'
        }, {
          value: 2,
          label: '新增Group'
        }],
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      // 遮罩层
      loading: true,
      fileList: [],
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 岗位表格数据
      postList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        gradeId: 1,
        classId: 0,
        groupId: 0
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        postName: [
          { required: true, message: "岗位名称不能为空", trigger: "blur" }
        ],
        postCode: [
          { required: true, message: "岗位编码不能为空", trigger: "blur" }
        ],
        postSort: [
          { required: true, message: "岗位顺序不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getWordClassAllList();
    this.getList();
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    getWordClassAllList() {
      getWordClassAllList().then(response => {
              this.classAllList = response;
            });
    },

    handlePreview() {
      console.log("ids" + this.ids);
      this.currWordId["wordId"] = this.ids[0];
      console.log("currWordId" + this.currWordId);
    },
    /** 查询岗位列表 */
    getList() {
      this.loading = true;
      if (this.queryParams.classId == "") {
        this.queryParams.classId = 0;
      }
      listPost(this.queryParams).then(response => {
        this.postList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 岗位状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        wordEn: undefined,
        wordCn: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
      console.log("handleSelectionChange" + this.ids);
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加New Word";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      console.log("handleUpdate" + row.id);
      this.reset();

      this.form["id"] = row.id;
      this.form["wordEn"] = row.wordEn;
      this.form["wordCn"] = row.wordCn;
      this.form["groupId"] = row.groupId;
      this.open = true;
      this.title = "修改Word";

      var wordId = row.id;
      // getWordInforByWordId(wordId).then(response => {
      //   this.form = response.data;
      //   this.open = true;
      //   this.title = "修改岗位";
      // });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          console.log(this.form.id);
          if (this.form.id != undefined) {
            updateWordByWordId(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addWord(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      // const wordId = row.id || this.ids;
      const wordId = row.id;
      
      const deleteWordId = {};
      deleteWordId["wordId"] = wordId;
      this.$confirm('wordId "' + wordId + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteEnglishWordById(deleteWordId);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有岗位数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportPost(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
  }
};
</script>