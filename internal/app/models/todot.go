package models

import (
	"bytes"
	"fmt"
	"html/template"
	"strconv"
	"strings"
)

// TodoT 定义一个查询结果的结构
type TodoT struct {
	ID         int    `db:"EVT_TODO_ID" json:"id" form:"id"`
	Category   string `db:"CTGY" json:"category" form:"category"`
	RefType    string `db:"REF_TYP" json:"ref_type" form:"ref_type"`
	RefTitle   string `db:"REF_TITLE" json:"ref_title" form:"ref_title"`
	Content    string `db:"TODO_CTENT" json:"content" form:"content"`
	OwnerName  string `db:"OWNER_NME" json:"owner_name" form:"owner_name"`
	OwnerEmail string `db:"EMAIL" json:"email" form:"email"`
	DueDate    string `db:"DUE_DTE" json:"due_date" form:"due_date"`
	Status     string `db:"TODO_STS" json:"status" form:"status"`

	// 设定的物料号，物料数量条件
	MatCode string `db:"MAT_CODE" json:"mat_code" form:"mat_code"`
	MatCond string `db:"MAT_COND" json:"mat_cond" form:"mat_cond"`

	// 物料的当前库存
	MatQty float64 `db:"MAT_QTY" json:"mat_qty" form:"mat_qty"`
}

const (
	// templateDir = "./templates"
	// templateDir = "C:/localWork/goTest/templates"

	matOpenSQL = ` select '物料提醒' CTGY, EVT_TODO_ID, ifnull(REF_TYP,'') REF_TYP, ifnull(REF_TITLE,'') REF_TITLE, ifnull(TODO_CTENT,'') TODO_CTENT, ifnull(OWNER_NME,'') OWNER_NME, ifnull(u.EMAIL,'') EMAIL, ifnull(DUE_DTE,'') DUE_DTE, ifnull(TODO_STS,'') TODO_STS,
									ifnull(MAT_CODE,'') MAT_CODE, ifnull(MAT_COND,'') MAT_COND
								from T_EVENT_TODO a
								left join t_users u on a.owner_nme = u.nme
									where (a.todo_sts is null or a.todo_sts = '')
										and a.mat_rule = '1' `
)

// 就是一个 map 函数
func mapTodoT(vs []TodoT, f func(TodoT) string) []string {
	vsm := make([]string, len(vs))
	for i, v := range vs {
		vsm[i] = f(v)
	}
	return vsm
}

// 取得不重复的邮箱
func distinctList(list []string) []string {
	// 借助 map 实现去重
	m := make(map[string]int)

	for _, v := range list {
		_, ok := m[v]
		// 如果不在 map 中，则加入到 map 中
		if !ok {
			m[v] = 1
		}
	}

	// 把 map 的 key 取出来返回
	n := make([]string, len(m))
	i := 0
	for k := range m {
		n[i] = k
		i++
	}

	return n
}

// 标准的 filter 函数
func filterTodoT(list []TodoT, test func(TodoT) bool) []TodoT {
	rtn := make([]TodoT, 0)
	for _, v := range list {
		if test(v) {
			rtn = append(rtn, v)
		}
	}

	return rtn
}

// ScanAllTodos 对所有 overdue，nextwk 的 todo ，生成待发送邮件
func ScanAllTodos() error {
	// 找到所有待办：overdue，nextweek
	sqlCmd := `
			select CTGY, EVT_TODO_ID, ifnull(REF_TYP,'') REF_TYP, ifnull(REF_TITLE,'') REF_TITLE, ifnull(TODO_CTENT,'') TODO_CTENT, ifnull(OWNER_NME,'') OWNER_NME, ifnull(u.EMAIL,'') EMAIL, ifnull(DUE_DTE,'') DUE_DTE, ifnull(TODO_STS,'') TODO_STS
			from (
			select '超期' CTGY, a.EVT_TODO_ID, a.ref_typ, a.ref_title, a.todo_ctent, a.owner_nme, a.due_dte, a.todo_sts
				from T_EVENT_TODO a
			where 1 = 1
				and (a.todo_sts is null or a.todo_sts = '')
				and a.due_dte <= date_format(now(), '%Y-%m-%d')
			union all
			select '近期' CTGY, a.EVT_TODO_ID, a.ref_typ, a.ref_title, a.todo_ctent, a.owner_nme, a.due_dte, a.todo_sts
				from T_EVENT_TODO a
			where 1 = 1
				and (a.todo_sts is null or a.todo_sts = '')
				and ( (a.due_dte > date_format(now(), '%Y-%m-%d') ) and (a.due_dte <= date_format(date_add(now(), interval 2 day), '%Y-%m-%d') ) )
			) cmb
			left join t_users u on cmb.owner_nme = u.nme
			order by cmb.owner_nme, cmb.ctgy desc, cmb.due_dte asc
		`
	return doScan(sqlCmd)
}

// doScan 执行 sqlCmd，把结果生成邮件，存入邮件表
func doScan(sqlCmd string) error {
	items := []TodoT{}
	err := db.Select(&items, sqlCmd)
	if err != nil {
		return err
	}

	// 返回 收信人的邮箱地址
	getOwnerEmail := func(i TodoT) string {
		return i.OwnerEmail
	}

	// 取得不同的收信地址
	allEmails := distinctList(mapTodoT(items, getOwnerEmail))

	// 加载 email template
	// 利用模板技术，生成 email body
	add := func(x, y int) int {
		return x + y
	}
	funcs := template.FuncMap{"add": add}

	emailTemplate := templateDir + "/todoEmail.tmpl"
	tmpl, err := template.New("todoEmail.tmpl").Funcs(funcs).ParseFiles(emailTemplate)
	if err != nil {
		return err
	}

	// 对每一个收信地址，生成一封待发送邮件
	for _, i := range allEmails {
		// 取出当前收件箱的所有 todos
		chkEmail := func(t TodoT) bool {
			return (strings.Compare(t.OwnerEmail, i) == 0)
		}
		ownerTodos := filterTodoT(items, chkEmail)

		err = createEmail(tmpl, ownerTodos)
		if err != nil {
			return err
		}
	}

	return nil
}

func createEmail(tmpl *template.Template, list []TodoT) error {
	// 列表空，直接返回
	if len(list) == 0 {
		return nil
	}

	// 取出第一个，对应邮件表中的一行记录
	p := list[0]

	notice := CreateEmailNotice()
	notice.UserName = p.OwnerName
	notice.SendTo = p.OwnerEmail
	notice.Subject = fmt.Sprintf("流程通知: 您有 %d 项待办", len(list))
	content, err := generateEmailBody(tmpl, list)
	if err != nil {
		return err
	}

	notice.Content = content
	err = notice.Insert()
	return err
}

func generateEmailBody(tmpl *template.Template, list []TodoT) (string, error) {
	// 利用模板技术，生成 email body
	// 模板只需要加载 1 次

	// 准备 template 所需的 params
	type param struct {
		TotalCount int
		Items      []TodoT
	}

	p := param{
		TotalCount: len(list),
		Items:      list,
	}

	// Stores the parsed template
	var buff bytes.Buffer

	// Send the parsed template to buff
	err := tmpl.Execute(&buff, p)
	if err != nil {
		return "", err
	}

	return buff.String(), nil
}

// ScanEvent 对一个事件下的待办，发通知
func ScanEvent(eventid int) error {
	sqlCmd := `
			select CTGY, EVT_TODO_ID, ifnull(REF_TYP,'') REF_TYP, ifnull(REF_TITLE,'') REF_TITLE, ifnull(TODO_CTENT,'') TODO_CTENT, ifnull(OWNER_NME,'') OWNER_NME, ifnull(u.EMAIL,'') EMAIL, ifnull(DUE_DTE,'') DUE_DTE, ifnull(TODO_STS,'') TODO_STS
			from (
				select '任务发布' CTGY, a.EVT_TODO_ID, a.ref_typ, a.ref_title, a.todo_ctent, a.owner_nme, a.due_dte, a.todo_sts
					from T_EVENT_TODO a
				where 1 = 1
					and (a.todo_sts is null or a.todo_sts = '')
					and ref_typ = 'Events'
					and ref_id = ` + strconv.Itoa(eventid) + ` ) cmb
				left join t_users u on cmb.owner_nme = u.nme
				order by cmb.owner_nme, cmb.ctgy desc, cmb.due_dte asc
		`
	return doScan(sqlCmd)
}
