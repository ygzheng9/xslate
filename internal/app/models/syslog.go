package models

// Syslog 系统操作日志
type Syslog struct {
	ID        int    `db:"id" json:"id" form:"id"`
	Username  string `db:"username" json:"username" form:"username"`
	ServerDT  string `db:"serverDT" json:"serverDT" form:"serverDT"`
	RemoteIP  string `db:"remoteIP" json:"remoteIP" form:"remoteIP"`
	FuncPoint string `db:"func" json:"func" form:"func"`
	Param     string `db:"param" json:"param" form:"param"`
}

const (
	logSelect = `select id, ifnull(username, '') username, ifnull(serverDT,'') serverDT,
			ifnull(remoteIP, 0) remoteIP, ifnull(func, '') func, ifnull(param, 0) param from t_logs`
)

// SyslogFindBy 根据条件查找
func SyslogFindBy(cond string) ([]Syslog, error) {
	sqlCmd := logSelect + cond

	items := []Syslog{}
	err := db.Select(&items, sqlCmd)

	return items, err
}

// SyslogFindAll 返回清单
func SyslogFindAll() ([]Syslog, error) {
	// 查询清单
	return SyslogFindBy(" order by id ")
}

// SyslogFindByID 按照 id 查询
func SyslogFindByID(id int) (Syslog, error) {
	cmd := logSelect + ` where id=?`
	item := Syslog{}
	err := db.Get(&item, cmd, id)
	return item, err
}

// SyslogInsert 当前对象，插入到数据库
func SyslogInsert(d Syslog) error {
	// 根据 struct 中的 DB tag 进行自动 named parameter
	cmd := `INSERT INTO t_logs (username, serverDT, remoteIP,	func, param) VALUES
						(:username, :serverDT, :remoteIP, :func,	:param)`
	_, err := db.NamedExec(cmd, d)
	return err
}
